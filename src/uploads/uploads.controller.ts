import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import type { Express, Response } from 'express';
import { FilesUploadDto } from './dtos/files-upload.dto';

@Controller('api/uploads')
export class UploadsController {
  //POST: ~/api/uploads
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('no file provided');
    console.log('file uploaded', file);
    return { message: 'file uploaded successfuly!' };
  }
  //POST: ~/api/uploads/multiple-files
  @Post('multiple-files')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FilesUploadDto, description: 'Multiple files upload' })
  uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0)
      throw new BadRequestException('no file provided');
    console.log('files uploaded', files);
    return { message: 'files uploaded successfuly!' };
  }
  //GET: ~/api/uploads/:images
  @Get('/:image')
  showUploadedImage(@Param('image') image: string, @Res() res: Response) {
    return res.sendFile(image, { root: 'images' });
  }
}
