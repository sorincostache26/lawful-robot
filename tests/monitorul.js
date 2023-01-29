const {By,Key,Builder,until, WebElement} = require("selenium-webdriver");
const fs = require('fs');
require("geckodriver");
const firefox = require('selenium-webdriver/firefox');

async function main() {  
   //selectors
  var url = "https://monitoruloficial.ro/e-monitor/";
  var dismissCookiesButton = '[aria-label="dismiss cookie message"]';
  var pageLoaded = '.footer-wrapper .widget_text';
  var partName = '.breadcrumb a';
  var publicationLinks = '.card-body a.btn';
  var currentDaySelection = 'div .today.day';

let driver = DriverBuilder();

//JSON init
let monitorJson = 
{
  "monitorul oficial":{}
};
var jsonTemplate = fs.readFileSync('./helpers/jsonTemplate.json');
var pdfTemplate = fs.readFileSync('./helpers/pdfTemplate.json');

//Load Page
await driver.get(url);
await driver.findElement(By.css(dismissCookiesButton)).click();
await driver.get(url);
await driver.findElement(By.css(pageLoaded));

// day selector - use this for testing a different day.
// await driver.sleep(2000);
// driver.executeScript("window.scrollBy(0, 450)", "");
// await driver.findElement(By.css('td[data-date="1674086400000"]')).click();
// await driver.sleep(2000);

//find current date
var myDate = new Date(0);
myDate.setUTCMilliseconds(await driver.findElement(By.css(currentDaySelection)).getAttribute('data-date'));
console.log("Today is: " + myDate.getDate() + "-" + (myDate.getMonth() + 1) + "-" + myDate.getFullYear());
console.log("-------");
var today = myDate.getDate() + "-" + (myDate.getMonth() + 1) + "-" + myDate.getFullYear();

if((await getAllParts(driver)).length==0){
  var jsonObj = {}
}else{
  var jsonObj = [] ;
for( part of (await getAllParts(driver))){
  var newJson = JSON.parse(jsonTemplate);
  
  let category = await part.findElement(By.css(partName));
  newJson.lawProject.name = await category.getText() ;
  console.log(await newJson.lawProject.name);

  console.log("Total number of elements -> " + (await part.findElements(By.css(publicationLinks))).length);
  for(let aLink of await part.findElements(By.css(publicationLinks))){
    newJson.lawProject.pdf.push(JSON.parse(pdfTemplate));
    newJson.lawProject.pdf[newJson.lawProject.pdf.length -1].name  = await aLink.getText();
    newJson.lawProject.pdf[newJson.lawProject.pdf.length -1].link = await aLink.getAttribute('href');
    newJson.lawProject.pdf[newJson.lawProject.pdf.length -1].date = formatDate(today);

    console.log(JSON.stringify(await newJson.lawProject.pdf[newJson.lawProject.pdf.length -1],null,'\t'));
  }
  
  jsonObj.push(await Promise.resolve(newJson));

  console.log("------------------->");
  }
}//endif

monitorJson["monitorul oficial"] = jsonObj;
console.log(JSON.stringify(monitorJson,null,'\t'));

//write file
if (!fs.existsSync('../downloads/')){
  fs.mkdirSync('../downloads/');
}
fs.writeFile('../downloads/monitorul.txt', JSON.stringify(monitorJson,null,'\t'), err => {
  if (err) console.error(err);
});

await driver.quit();
}

function DriverBuilder() {
  let firefoxOptions = new firefox.Options().headless();
  firefoxOptions.setPreference("browser.download.folderList", 2);
  firefoxOptions.setPreference("pdfjs.disabled", true);
  firefoxOptions.setPreference("browser.download.dir", "../downloads");
  let driver = new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(firefoxOptions)
    .build();
  return driver;
}

function getAllParts(driver){
var allParts = "div#showmo .card-body";
  return driver.findElements(By.css(allParts)).then(function(elements){
      var allPromises = elements.map(function(element){
          return element;
      });
      return Promise.all(allPromises);
  });     
}

function formatDate(date) {
  if (!date || date == 'undefined') {
    return date;
  }

  let dateArray = date.split("-");
  let day = dateArray[0];
  let month = dateArray[1];
  let year = dateArray[2];
  
  let dayString = day.toString().padStart(2, '0');
  let monthString = month.toString().padStart(2, '0');
  
  return `${dayString}-${monthString}-${year}`;
}

main()