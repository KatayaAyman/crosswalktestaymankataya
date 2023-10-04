import { Injectable } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Tag } from './tag.entity';
import { ITagsRO } from './tag.interface';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: EntityRepository<Tag>,
  ) {}

  async findAll(): Promise<ITagsRO> {
    const tags = await this.tagRepository.findAll();
    return { tags: tags.map((tag) => tag.tag) };
  }

  async createTagsIfNotExist(tags: string[]): Promise<Tag[]> {
    const createdTags: Tag[] = [];

    for (const tagName of tags) {
      let tag = await this.tagRepository.findOne({ tag: tagName });

      // If the tag does not exist, create a new tag
      if (!tag) {
        // Find the maximum count in the database + 1
        const newId = await this.tagRepository.count() + 1;

        // Create a new tag entity with the incremented count
        tag = new Tag();
        tag.tag = tagName;
        tag.id = newId;

        // Save the new tag entity to the database
        await this.tagRepository.persistAndFlush(tag);
      }

      createdTags.push(tag);
    }

    return createdTags;
  }
}
