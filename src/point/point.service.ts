import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';

import { Point, PointDocument } from './schemas/point.schema';

import { Tag, TagDocument } from './schemas/tag.schema';
import mongoose,{ Model,PaginateModel,PaginateResult } from 'mongoose';
import { customAlphabet } from 'nanoid'
import {DeleteResult} from "mongodb";
import { CreateTagDto } from "./dto/create-tag.dto";

import { REQUEST } from "@nestjs/core";
import { UserService } from "src/user/user.service";
import { QueryPointDto } from "./dto/query-point.dto";

export type CURUSER = {
    user:{
        userId:string
    }
}

@Injectable({ scope: Scope.REQUEST })
export class PointService {
    
    constructor(
    @InjectModel(Point.name) private readonly pointModel: PaginateModel<PointDocument>,
    @InjectModel(Tag.name) private readonly tagModel: Model<TagDocument>,
    @Inject(REQUEST) private readonly req: CURUSER) {}

    async findOne(id: string): Promise<Point> {
        return this.pointModel.findOne({ _id:id }).exec();
    }

    async findAll(): Promise<any[]> {
        let list = await this.tagModel.find({user:this.req.user.userId}).exec();

        let result = []
        for (var i = 0 ; i < list.length ; i++) {
            let children = this.pointModel.find({tag:list[i]._id,user:this.req.user.userId}).exec()
            const o = {
                title:list[i].desc,
                key:list[i]._id,
                value:list[i]._id,
                children: (await children).map(k=>{
                    return {
                        title:k.desc+"("+k.code+")",
                        key:k.code,
                        value:k.code,
                        desc:k.desc
                    }
                })
            }
            result.push(o)
        }
        return result
    }
    async findAllByPage(pageStart:string='1', pageSize: string='10',query:Point): Promise<PaginateResult<PointDocument>> {
        const options = {
            populate: ['tag'],
            page: Number(pageStart),
            limit: Number(pageSize),
        };
        const q:any = {user:this.req.user.userId}
        if (query.desc) {
            q.desc = {$regex: query.desc, $options: 'i'}
        }
        if (query.code) {
            q.code = {$regex: query.code, $options: 'i'}
        }
        const result = await this.pointModel.paginate(q,options)
        return result
    }
    async findOneByCode(code:string): Promise<Point> {
        return this.pointModel.findOne({code:code}).exec();
    }

    async createTag(desc:string,userId:string): Promise<Tag> {
        return await this.tagModel.create({desc:desc,user:this.req.user.userId});
    }

    async create(dto:CreateTagDto,userId:string): Promise<Point> {
        const nanoid = customAlphabet('123456789', 6)
        const code = nanoid() // 随机且唯一code
        return await this.pointModel.create({
            code,
            user:this.req.user.userId,
            tag:dto.tagId,
            desc:dto.desc,
        })
    }
    async findAllTags(): Promise<Tag[]> {
        let list = await this.tagModel.find({user:this.req.user.userId}).exec();

        return list
    }

    deleteById(id:string):Promise<DeleteResult>{
        return this.pointModel.deleteOne({_id:id}).exec();

    }
    /*async updateUser(userId: string, userUpdates: UpdateUserDto): Promise<User> {
        return this.usersRepository.findOneAndUpdate({ userId }, userUpdates);
    }*/
}