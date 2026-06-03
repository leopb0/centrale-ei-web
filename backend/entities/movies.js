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
      type: String,
      nullable: true,
    },
    rating: {
      type: 'float',
      nullable: true,
    },
    imageUrl: {
      type: String,
      nullable: true,
    },
    // 🎬 1. LE GENRE
    // Option simple : une chaîne de caractères (ex: "Action", "Sci-Fi, Drama")
    genre: {
      type: String,
      nullable: true,
    },
    // 🔥 2. LA POPULARITÉ
    // Utilisation de 'float' pour stocker une valeur précise entre 0 et 1 (ex: 0.85)
    popularity: {
      type: 'float',
      nullable: false,
      default: 0.0, // Par défaut, un film commence à 0 s'il n'est pas populaire
    },
    // 🔞 3. L'ÂGE MINIMAL
    // Un entier (ex: 0, 12, 16, 18) pour filtrer les recommandations
    minAge: {
      type: Number,
      nullable: false,
      default: 0, // Par défaut, tout public (0 an)
    },
    languages: {
      type: 'simple-json',
      nullable: true,
    },
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
    updatedAt: {
      type: 'datetime',
      updateDate: true,
    },
  },
});

export default Movie;
