//You can require things here if needed.


module.exports = (text, event) => {

  if(text.includes('cat'))
    return "Man, I love cats... I had 9 at one point in time!"


  //default case, return what the user sent
  return text
}
