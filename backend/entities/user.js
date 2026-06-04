import typeorm from 'typeorm';

const User = new typeorm.EntitySchema({
  name: 'User',
  columns: {
    id: {
      primary: true,
      type: Number,
      generated: true,
    },
    email: {
      type: String,
      unique: true,
    },
    firstname: { type: String },
    lastname: { type: String },
    password: { type: String },
  },
  relations: {
    likes: {
      type: 'one-to-many',
      target: 'Like',
      inverseSide: 'user',
      onDelete: 'CASCADE', // Si l'user est supprimé, ses likes disparaissent
    },
  },
});

export default User;
