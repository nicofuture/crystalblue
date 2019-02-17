const FILE = 'Crystal Blue.mp3';
const outsideColor = '#68a0b0';
const insideColor = '#a7d8de';



/**
 *  Re-group the array of FFT bins into an
 *  array of more meaningful values
 *  using the splitOctaves method.
 */

var source, fft;
var body = document.documentElement;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  let canvas = document.querySelector('canvas');
  canvas.style.width = "100%";

  noFill();

  soundFormats('mp3');
  source = loadSound(FILE);

  source._looping = true;
  console.dir(source)

  canvas.addEventListener('click', function () {

    // play or pause track depending on state
    if (!source._playing) {
      source.play();
      // console.dir(source);
    } else if (source._playing) {
      source.pause();
    }

  });






  fft = new p5.FFT(0.8, 1024);
  fft.setInput(source);
}

function draw() {
  background(outsideColor);
  var spectrum = fft.analyze();
  var newBuffer = [];

  // scaledSpectrum is a new, smaller array of more meaningful values
  var scaledSpectrum = splitOctaves(spectrum, 3);
  var len = scaledSpectrum.length;

  // draw shape
  beginShape();

  // one at the far corner
  curveVertex(0, height);
  curveVertex(0, height);

  for (var i = 0; i < len; i++) {
    var point = smoothPoint(scaledSpectrum, i);
    var x = map(i, 0, len - 1, 0, width);
    var y = map(point, 0, 255, height, 0);
    curveVertex(x, y);
  }


  // one last point at the end
  curveVertex(width, height);
  curveVertex(0, height);
  curveVertex(0, height);
  fill(insideColor);
  stroke(insideColor);

  endShape();
}


/**
 *  Divides an fft array into octaves with each
 *  divided by three, or by a specified "slicesPerOctave".
 *
 *  There are 10 octaves in the range 20 - 20,000 Hz,
 *  so this will result in 10 * slicesPerOctave + 1
 *
 *  @method splitOctaves
 *  @param {Array} spectrum Array of fft.analyze() values
 *  @param {Number} [slicesPerOctave] defaults to thirds
 *  @return {Array} scaledSpectrum array of the spectrum reorganized by division
 *                                 of octaves
 */
function splitOctaves(spectrum, slicesPerOctave) {
  var scaledSpectrum = [];
  var len = spectrum.length;

  // default to thirds
  var n = slicesPerOctave || 3;
  var nthRootOfTwo = Math.pow(2, 1 / n);

  // the last N bins get their own
  var lowestBin = slicesPerOctave;

  var binIndex = len - 1;
  var i = binIndex;


  while (i > lowestBin) {
    var nextBinIndex = round(binIndex / nthRootOfTwo);

    if (nextBinIndex === 1) return;

    var total = 0;
    var numBins = 0;

    // add up all of the values for the frequencies
    for (i = binIndex; i > nextBinIndex; i--) {
      total += spectrum[i];
      numBins++;
    }

    // divide total sum by number of bins
    var energy = total / numBins;
    scaledSpectrum.push(energy);

    // keep the loop going
    binIndex = nextBinIndex;
  }

  // add the lowest bins at the end
  for (var j = i; j > 0; j--) {
    scaledSpectrum.push(spectrum[j]);
  }

  // reverse so that array has same order as original array (low to high frequencies)
  scaledSpectrum.reverse();

  return scaledSpectrum;
}



// average a point in an array with its neighbors
function smoothPoint(spectrum, index, numberOfNeighbors) {

  // default to 2 neighbors on either side
  var neighbors = numberOfNeighbors || 2;
  var len = spectrum.length;

  var val = 0;

  // start below the index
  var indexMinusNeighbors = index - neighbors;
  var smoothedPoints = 0;

  for (var i = indexMinusNeighbors; i < (index + neighbors) && i < len; i++) {
    // if there is a point at spectrum[i], tally it
    if (typeof (spectrum[i]) !== 'undefined') {
      val += spectrum[i];
      smoothedPoints++;
    }
  }

  val = val / smoothedPoints;

  return val;
}
