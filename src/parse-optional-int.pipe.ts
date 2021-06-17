import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseOptionalIntPipe implements PipeTransform {
  constructor(private readonly defaultValue?: number) {}

  transform(value: string, metadata: ArgumentMetadata): number {
    if (!value) {
      return this.defaultValue || null;
    }

    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
