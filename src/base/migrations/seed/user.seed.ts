import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/app/user/entities/user.entity';
import { Repository } from 'typeorm';

const data = [
  {
    id: 1,
    username: 'SuperAdmin',
    email: 'admin@gmail.com',
    password: '$2b$10$md4f4NPUESBurVLD7uhiD.nSNIQQbp7l3Yne.fCR.BiVZl6gDWDgq',
    avatar: 'avatar.jpg',
    role: 'SuperAdmin',
    uav: 1,
    status: 1,
    createdAt: '2024-01-22T15:39:11.506Z',
    updatedAt: '2024-01-25T04:55:55.313Z',
  },
  {
    id: 2,
    username : "Student1",
    email : "student1@gmail.com",
    password : "$2b$10$md4f4NPUESBurVLD7uhiD.nSNIQQbp7l3Yne.fCR.BiVZl6gDWDgq",
    avatar : "avatar.jpg",
    role : "Student",
    uav : 1,
    status : 1,
    createdAt : "2024-01-22T15:39:11.506Z",
    updatedAt : "2024-01-25T04:55:55.313Z"
  },
  {
    id: 3,
    username : "thay Trung",
    email : "thaytrung@gmail.com",
    password : "$2b$10$md4f4NPUESBurVLD7uhiD.nSNIQQbp7l3Yne.fCR.BiVZl6gDWDgq",
    avatarURL : "avatar.jpg",
    role : "Teacher",
    uav : 1,
    status : 1,
    createdAt : "2024-01-22T15:39:11.506Z",
    updatedAt : "2024-01-25T04:55:55.313Z"
  },
  {
    id : 4,
    username : "thay Tung",
    email : "thaytung@gmail.com",
    password : "$2b$10$md4f4NPUESBurVLD7uhiD.nSNIQQbp7l3Yne.fCR.BiVZl6gDWDgq",
    avatarURL : "avatar.jpg",
    role : "Teacher",
    uav : 1,
    status : 1,
    createdAt : "2024-01-22T15:39:11.506Z",
    updatedAt : "2024-01-25T04:55:55.313Z"
  },
  {
    id : 5,
    username : "thay Giap",
    email : "thaygiap@gmail.com",
    password : "$2b$10$md4f4NPUESBurVLD7uhiD.nSNIQQbp7l3Yne.fCR.BiVZl6gDWDgq",
    avatarURL : "avatar.jpg",
    role : "Teacher",
    uav : 1,
    status : 1,
    createdAt : "2024-01-22T15:39:11.506Z",
    updatedAt : "2024-01-25T04:55:55.313Z"
  }
];

@Injectable()
export class UserSeed {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repoUser: Repository<UserEntity>,
  ) {}

  async seed() {
    const count = await this.repoUser.count();
    if (count) return;
    return this.repoUser.save(data);
  }
}
