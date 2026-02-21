map.on('load', () => {
    map.addLayer({
      id: 'terrain-data',
      type: 'line',
      source: {
        type: 'vector',
        url: 'mapbox://styles/myspaceslvt/cm07lv4i4013b01qr2n348abd'
      },
      'source-layer': 'contour'
    });
  });