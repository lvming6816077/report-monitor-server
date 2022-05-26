import { Body, Controller, Query, Get, Param, Post, Inject, UseGuards, Request } from '@nestjs/common';
import { PointService } from './point.service';
import { Point, PointDocument } from './schemas/point.schema';
import { Tag } from './schemas/tag.schema';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { JwtAuthGuard } from 'src/config/jwt-config/jwtAuth.guard';
import { CreatePointDto } from './dto/create-point.dto'
import { CreateTagDto } from './dto/create-tag.dto'
import { QueryPointDto } from './dto/query-point.dto'
import { PaginateResult } from 'mongoose';
import { DeleteResult } from 'mongodb'
import { UserService } from 'src/user/user.service';

@Controller('point')
@UseGuards(JwtAuthGuard)
export class PointController {
    constructor(
        private readonly pointService: PointService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,

        private readonly userService: UserService,
    ) { }


    @Post('create')
    async createPoint(@Body() dto: CreatePointDto, @Request() req: any) {
        console.log(dto)
        return await this.pointService.create(dto, req.user.userId);
    }
    @Post('createtag')
    async createTag(@Body() dto: CreateTagDto, @Request() req: any) {
        console.log(req.user)
        return await this.pointService.createTag(dto.desc, req.user.userId);
    }
    @Post('savePointSet')
    async savePointSet(@Body() dto:{codes?:string[]}, @Request() req: any) {

        let u = await this.userService.updateUser(dto.codes.join(','), req.user.userId);
        return u.pointset
    }

    @Get('getPoints')
    async getPoints(): Promise<Point[]> {
        return this.pointService.findAll();
    }
    @Get('getPointsAndPointset')
    async getPointsAndPointset(@Request() req: any): Promise<any> {
        let u = await this.userService.findUserByUserId(req.user.userId);
        let list = await this.pointService.findAll();
        return {
            pointset:u.pointset,
            list
        }
    }
    @Get('getPointsList')
    async getPointsList(@Query() query: QueryPointDto): Promise<PaginateResult<PointDocument>> {
        return this.pointService.findAllByPage(query.pageStart, query.pageSize, query);
    }


    @Get('getTags')
    async getTags(): Promise<Tag[]> {
        return this.pointService.findAllTags();
    }

    @Get(':id')
    async getPointById(@Param('id') id: string): Promise<Point> {
        return this.pointService.findOne(id);
    }

    @Get('deletePoint/:id')
    async deletePoint(@Param('id') id: string): Promise<DeleteResult> {
        return this.pointService.deleteById(id);
    }

    //   @Delete(':id')
    //   async delete(@Param('id') id: string) {
    //     return this.catsService.delete(id);
    //   }
}


