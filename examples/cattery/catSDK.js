const { writeFile, readFile, unlink } = require('fs').promises;
const { nanoid  } = require('nanoid');

class CatSDK {
  constructor(cattery) {
    this.cattery = cattery;
  }
  async create(nickname, color) {
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
  async update(id, nickname, color) {
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
  async read(id) {
    const fileContents = await readFile(
      this.cattery + '/' + id + '.json',
      'utf-8'
    );
    const cat = JSON.parse(fileContents);
    return cat;
  }
  async destroy(id) {
    await unlink(
      this.cattery + '/' + id + '.json',
    );
    return null;
  }
}

module.exports = {
  CatSDK,
};