// @flow strict
const { writeFile, readFile, unlink } = require('fs').promises;
const { nanoid  } = require('nanoid');
/*::
export type Cat = {
  id: string,
  nickname: string,
  color: string,
};
*/

class CatSDK {
  /*:: cattery: string*/
  constructor(cattery/*: string*/) {
    this.cattery = cattery;
  }
  async create(nickname/*: string*/, color/*: string*/)/*: Promise<Cat>*/ {
    const newCat = {
      nickname,
      color,
      id: nanoid(),
    };
    await writeFile(
      this.cattery + '/' + newCat.id + '.json',
      JSON.stringify(newCat, null, 2)
    );
    return newCat;
  }
  async update(id/*: string*/, nickname/*: string*/, color/*: string*/)/*: Promise<Cat>*/ {
    const updatedCat = {
      nickname,
      color,
      id,
    };
    await writeFile(
      this.cattery + '/' + updatedCat.id + '.json',
      JSON.stringify(updatedCat, null, 2)
    );
    return updatedCat;
  }
  async read(id/*: string*/)/*: Promise<Cat>*/ {
    const fileContents = await readFile(
      this.cattery + '/' + id + '.json',
      'utf-8'
    );
    const cat = JSON.parse(fileContents);
    return cat;
  }
  async destroy(id/*: string*/)/*: Promise<void>*/ {
    await unlink(
      this.cattery + '/' + id + '.json',
    );
  }
}

module.exports = {
  CatSDK,
};