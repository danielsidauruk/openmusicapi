exports.up = (pgm) => {
  pgm.addColumn('albums', {
    coverurl: {
      type: 'TEXT',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'coverurl');
};
