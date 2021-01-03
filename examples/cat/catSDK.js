// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
const { toString, toObject } = require('@lukekaalim/cast');
const { join } = require('path');
const { writeFile, readFile, mkdir, unlink } = require('fs').promises;
const { nanoid  } = require('nanoid');

/*::
export type CatID = string;
export type Cat = {
  id: CatID,
  nickname: string,
  color: string,
};
*/
const toCat/*: Cast<Cat>*/ = (value) => {
  const object = toObject(value);
  return {
    id: toString(object.id),
    nickname: toString(object.nickname),
    color: toString(object.color),
  }
};

class CatSDK {
  /*:: catDirectory: string*/
  constructor(catDirectory/*: string*/) {
    this.catDirectory = catDirectory;
  }
  getCatPath(id/*: string*/)/*: string*/ {
    return join(this.catDirectory, `${id}.json`);
  }
  async create(color/*: string*/, nickname/*: string*/)/*: Promise<Cat>*/ {
    const newCat =  {
      id: nanoid(),
      color,
      nickname,
    };
    await mkdir(this.catDirectory, { recursive: true });
    await writeFile(this.getCatPath(newCat.id), JSON.stringify(newCat, null, 2));
    return newCat;
  }
  async read(id/*: string*/)/*: Promise<Cat>*/ {
    const cat = JSON.parse(await readFile(this.getCatPath(id), 'utf-8'));
    return cat;
  }
  async update(id/*: string*/, color/*: string*/, nickname/*: string*/)/*: Promise<Cat>*/ {
    const updatedCat =  {
      id,
      color,
      nickname,
    };
    await writeFile(this.getCatPath(updatedCat.id), JSON.stringify(updatedCat, null, 2));
    return updatedCat;
  }
  async destroy(id/*: string*/)/*: Promise<null>*/ {
    await unlink(this.getCatPath(id))
    return null;
  }
}

module.exports = {
  CatSDK,
  toCat,
};
