import typeorm from 'typeorm';

const Like = new typeorm.EntitySchema({
  name: 'Like',
  columns: {
    id: {
      primary: true,
      type: Number,
      generated: true,
    },
    // true = Like, false = Dislike
    isLike: {
      type: Boolean,
      nullable: false,
    },
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
  },
  // 🔗 Les relations vers les autres tables
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      inverseSide: 'likes',
      onDelete: 'CASCADE', // Si l'user est supprimé, ses likes disparaissent
    },
    movie: {
      type: 'many-to-one',
      target: 'Movie',
      inverseSide: 'likes',
      onDelete: 'CASCADE', // Si le film est supprimé, les likes associés disparaissent
    },
  },
});

export default Like;
