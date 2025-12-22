import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiOperation as SwgOperation,
  ApiTags as SwgApiTag,
  ApiOperationOptions,
  ApiBearerAuth,
  ApiResponseOptions,
  ApiResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
  ApiHeaderOptions,
  ApiHeader,
} from '@nestjs/swagger';
import { PaginatedMeta, PaginatedResult } from './pagination.schema';

const createApiOperation = (defaultOption: ApiOperationOptions) => {
  return (option?: ApiOperationOptions): MethodDecorator =>
    SwgOperation({
      ...defaultOption,
      ...option,
    });
};

export const ApiOperation = createApiOperation({
  summary: 'Summary description',
});
export const ApiListOperation = createApiOperation({
  summary: 'Liệt kê danh sách tất cả bản ghi',
});
export const ApiRetrieveOperation = createApiOperation({
  summary: 'Lấy thông tin chi tiết 1 bản ghi',
});
export const ApiCreateOperation = createApiOperation({
  summary: 'Tạo mới 1 bản ghi',
});
export const ApiUpdateOperation = createApiOperation({
  summary: 'Sửa 1 bản ghi',
});
export const ApiPartialOperation = createApiOperation({
  summary: 'Sửa 1 bản ghi',
});
export const ApiDeleteOperation = createApiOperation({
  summary: 'Xoá 1 bản ghi',
});
export const ApiBulkDeleteOperation = createApiOperation({
  summary: 'Xoá hàng loạt',
});
export const ApiBulkUpdateOperation = createApiOperation({
  summary: 'Sửa hàng loạt',
});
export const ApiUpdateManyOperation = createApiOperation({
  summary: 'Sửa nhiều bản ghi có dữ liệu cập nhật khác nhau',
});

export function ApiTagAndBearer(...tags: string[]) {
  return applyDecorators(
    ApiLanguageHeader(),
    ApiBearerAuth(),
    SwgApiTag(...tags),
  );
}

export function ApiResponses(tags: ApiResponseOptions[]) {
  let apiResponses: MethodDecorator[] = tags.map((tag) => ApiResponse(tag));
  return applyDecorators(...apiResponses);
}

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model?: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(... model ? [PaginatedResult, model] : [PaginatedResult]),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResult) },
          {
            properties: {
              data: {
                type: 'array',
                items: model ? { $ref: getSchemaPath(model) } : undefined,
              },
              pagination: {
                type: 'object',
                items: { $ref: getSchemaPath(PaginatedMeta) },
              },
            },
          },
        ],
      },
    }),
  );
};

export function ApiWorkPlaceHeader(
  header?: ApiHeaderOptions,
): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiHeader({
      description: 'Không gian làm việc',
      name: 'Trung Bin',
      required: true,
      ...header,
    }),
  );
}

export function ApiLanguageHeader(
  header?: ApiHeaderOptions,
): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiHeader({
      description: 'Language {string} : ngôn ngữ',
      name: 'x-ngôn ngữ',
      enum: ['vi', 'en'],
      ...header,
    }),
  );
}
