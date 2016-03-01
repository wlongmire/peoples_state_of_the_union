var extractLastWord = function(text) {
  var lastSpace = text.lastIndexOf(' ');
  return [text.substring(0, lastSpace), text.substring(lastSpace + 1)];
}

var splitText = function(text, width, ctx) {
  if (width === 0) return [];

  var result = [text];
  var i = 0;
  var r, split;

  while (r = result[i++]) {
    if (ctx.measureText(r).width >= width) {
      result.push('');
    }
    
    while (ctx.measureText(r).width >= width) {
      split = extractLastWord(r);
      if (split[0] === '') break;
      r = split[0];
      result[i] = split[1] + ' ' + result[i];
    }

    result[i - 1] = r.trim();
  }

  if (result[result.length -1] === '') result.splice(-1, 1);

  return result;
}

window.splitText = splitText;
