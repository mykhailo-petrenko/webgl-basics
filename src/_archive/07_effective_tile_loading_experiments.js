import {ImageLoader} from '@loaders.gl/images';
import {load} from '@loaders.gl/core';


const urlGenerator = (i) => {
  i = 9 + i;
  return `https://b.tiles.mapbox.com/v4/mapbox.satellite/15/18753/88${i}@2x.png?access_token=pk.eyJ1IjoidmxhZHphaXRzZXYiLCJhIjoiY2ptOTFpcXJhMDEwZTNzcTlwOHl3eXpqbSJ9.mI1ppBX66g6wC3N2yP3WJA&`;
};

const AsyncLoader = async () => {
  const r = [];

  for (let i = 0; i < 80; i++) {
    r.push(load(urlGenerator(i), ImageLoader, {
      type: 'imagebitmap',
      decode: true,
      worker: true,
    }));
  }

  return await Promise.all(r);
};

const canvas = document.getElementById('canvasLeft');

window.loadImages = async () => {
  const images = await AsyncLoader();
  console.log(images);

  const ctx_2d = canvas.getContext('2d');

  ctx_2d.drawImage(images[10], 0, 0, images[10].width, images[10].height);

  requestAnimationFrame(window.loadImages);
};



window.loadImages();
