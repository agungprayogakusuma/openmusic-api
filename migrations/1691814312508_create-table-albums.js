/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
  });

  pgm.addConstraint(
      'songs',
      'fk_songs.album_id',
      'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE',
  );
};

exports.down = pgm => {
  pgm.dropConstraint('songs', 'fk_songs.album_id');
  pgm.dropTable('albums');
};
