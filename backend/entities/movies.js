import typeorm from 'typeorm';

const Movie = new typeorm.EntitySchema({
  name: 'Movie',
  columns: {
    id: {
      primary: true,
      type: Number,
      generated: true,
    },
    name: {
      type: String,
      nullable: false,
    },
    director: {
      type: String,
      nullable: true,
    },
    releaseYear: {
      type: Number,
      nullable: true,
    },
    duration: {
      type: Number,
      comment: 'Durée en minutes',
      nullable: true,
    },
    synopsis: {
      type: String, // Devient un type TEXT en SQL pour les longs textes
      nullable: true,
    },
    rating: {
      type: 'float', // Permet de mettre des notes à virgule (ex: 4.5)
      nullable: true,
    },
    imageUrl: {
      type: String,
      nullable: true, // Utile pour stocker le lien de l'affiche du film
    },
    createdAt: {
      type: 'datetime', // ou 'timestamp' selon ta base de données
      createDate: true, // TypeORM gère automatiquement la date de création
    },
    updatedAt: {
      type: 'datetime',
      updateDate: true, // TypeORM met à jour la date automatiquement à chaque modification
    },
  },
});

export default Movie;
