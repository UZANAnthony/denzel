# DENZEL

> The must-watch Denzel's movies

## DEPLOYMENT

Final project: https://uzan-denzel.glitch.me/graphql

![denzel](https://m.media-amazon.com/images/M/MV5BMjE5NDU2Mzc3MV5BMl5BanBnXkFtZTcwNjAwNTE5OQ@@._V1_SY1000_SX750_AL_.jpg)


## 🐣 Introduction

Denzel Washington is one of my favorite actor.

He won 2 Oscars. [Another 82 wins & 166 nominations](https://www.imdb.com/name/nm0000243/awards?ref_=nm_awd)

## 🎯 Objectives

**Build a REST and GRAPHQL API to get the must-watch Denzel's movies**.

## GRAPHQL

Populate the database

{
  populate
}


Fetch a random must-watch movie

{
  movie{
    title
    year
    metascore
  }
}


Fetch a specific movie

{
  movieID(id: "tt0765429"){
    title
    metascore
    review
    date
  }
}


Search for Denzel's movies

{
  movieSearch(limit: 5, metascore: 70){
    title
    year
    metascore
  }
}


Save a watched date and a review.

{
  movieMut(id: "tt0765429", date: "2019-1-1", review: "Awesome!")
}

## API REST

requests like the initial read me



