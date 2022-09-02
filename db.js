const {Pool} = require('pg')

const pool = new Pool();

class DataBase {
  async createUser(tgId) {
    const user = await pool.query(`
      SELECT * FROM public.users WHERE "tgId" = '${tgId}';
    `)

    if(!user.rows.length) {
      await pool.query(`
        INSERT INTO public.users("tgId") VALUES(${tgId});
      `)
    }
    return null
  }

  async getBreedsList(page, letter) {
    const breedsNames = await pool.query(`
      SELECT id,name FROM public.dog WHERE name LIKE '${letter}%' LIMIT 8 OFFSET ${page * 8};
    `)
    return breedsNames.rows.map(row => {
      return {
        name: row.name.substr(0,33),
        id: row.id
      }
    });
  }

  async searchBreeds(searchQuery, page) {
    const breedsNames = await pool.query(`
      SELECT id,name FROM public.dog WHERE name LIKE '%${searchQuery}%' LIMIT 8 OFFSET ${page * 8};
    `)
    return breedsNames.rows.map(row => {
      return {
        name: row.name.substr(0,33),
        id: row.id
      }
    });
  }

  async getFavouriteList(tgId, page) {
    const breedsNames = await pool.query(`
      SELECT id,name FROM public.dog 
      WHERE id IN (
        SELECT dog_id FROM public.favourite WHERE users_id IN(
            SELECT "id" FROM public.users WHERE "tgId" = '${tgId}'
        )
      ) 
      LIMIT 8 OFFSET ${page * 8};
    `)

    return breedsNames.rows.map(row => {
      return {
        name: row.name.substr(0,33),
        id: row.id
      }
    });
  }

  async getDogFullData(breedId) {
    const dogData = await pool.query(`
      SELECT * FROM public.dog WHERE id = '${breedId}'
    `)

    const dogInfo = await pool.query(`
      SELECT note FROM public.info WHERE id = '${dogData.rows[0]["info_id"]}'
    `)

    const dogColor = await pool.query(`
      SELECT color FROM public.colors WHERE id = '${dogData.rows[0]["colors_id"]}';
    `)

    return {
      breedName: dogData.rows[0].name,
      breedInfo: dogInfo.rows[0].note,
      breedColor: dogColor.rows[0].color
    }
  }

  async addFavourite(tgId, breedId) {
    // INSERT INTO public.favourite(dog_id,users_id) VALUES(1,1);
    const user = await pool.query(`
      SELECT id FROM public.users WHERE "tgId" = '${tgId}';
    `)
    const userId = user.rows[0].id;
    const favourite = await pool.query(`
      SELECT * FROM public.favourite 
      WHERE dog_id = '${breedId}' 
      AND users_id = '${userId}'
    `)

    if(!favourite.rows.length) {
      await pool.query(`
        INSERT INTO public.favourite(dog_id, users_id)
        VALUES('${breedId}','${userId}')
      `)

      return true;
    }

    return false;
  }
}

module.exports = new DataBase();