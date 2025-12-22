import {
  AbilityBuilder,
  AbilityOptionsOf,
  CanParameters,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  createMongoAbility,
} from '@casl/ability';
import { isInstance } from 'class-validator';
import { UserEntity } from 'src/app/user/entities/user.entity';
import * as _ from 'lodash';
import { ForbiddenException } from 'src/base/exceptions/custom.exception';
import { User } from 'src/auth/interfaces/user.class';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

type Subject = InferSubjects<typeof UserEntity> | 'all';

export type AppAbility = MongoAbility<[Action, Subject]>;

export class CaslAbilityFactory {
  createForUser(user: User) {
    const { build } = this.newAbilityBuilder();
    return this.buildPolicy(build);
  }

  protected newAbilityBuilder(): AbilityBuilder<AppAbility> {
    return new AbilityBuilder<AppAbility>(createMongoAbility);
  }

  protected buildPolicy(
    build: (option: AbilityOptionsOf<AppAbility>) => any,
  ): AppAbility {
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subject>,
    });
  }

  assertAbility(
    userOrPolicy: AppAbility | User,
    ...[action, subject, field]: CanParameters<any>
  ) {
    const policy = this.createForUser(userOrPolicy as User);
    if (!this.hasAbility(policy, action, subject, field)) {
      this.throwForbidden(policy, action, subject, field);
    }
  }

  hasAbility(
    policy: AppAbility,
    ...[action, subject, field]: CanParameters<any>
  ) {
    const can = policy.can(action, subject, field);
    return can;
  }

  throwForbidden(
    policy: AppAbility,
    ...[action, subject, field]: CanParameters<any>
  ) {
    const subjectType = policy.detectSubjectType(subject);
    const subjectName = _.snakeCase(_.get(subjectType, 'name')).toUpperCase();
    throw new ForbiddenException(
      `CANNOT_${action.toUpperCase()}_ON_${subjectName}`,
    );
  }
}
