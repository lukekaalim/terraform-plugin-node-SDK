const { writeFile, readFile, unlink } = require('fs').promises;
const { nanoid  } = require('nanoid');

class CatSDK {
  constructor(cathouse) {
    this.cathouse = cathouse;
  }
  async create(nickname, color) {
    const newCat = {
      nickname,
      color,
      id: nanoid(),
    };
    await writeFile(
      this.cathouse + '/' + newCat.id + '.json',
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
      this.cathouse + '/' + updatedCat.id + '.json',
      JSON.stringify(updatedCat, null, 2)
    );
    return updatedCat;
  }
  async read(id) {
    const fileContents = await readFile(
      this.cathouse + '/' + id + '.json',
      'utf-8'
    );
    const cat = JSON.parse(fileContents);
    return cat;
  }
  async destroy(id) {
    await unlink(
      this.cathouse + '/' + id + '.json',
    );
    return null;
  }
}

module.exports = {
  CatSDK,
};