const {By,Key,Builder,until, WebElement} = require("selenium-webdriver");
const fs = require('fs');
require("geckodriver");
const firefox = require('selenium-webdriver/firefox');

async function main() {  
//selectors
var url = "http://sgglegis.gov.ro/legislativ/";
var pageLoaded = '.act tbody tr[align]';
var titlesRows = '.act tbody tr:not(tr[align])';
var blankLink = 'http://sgglegis.gov.ro/legislativ/docs/';

let driver = DriverBuilder();

//JSON init
let secretariatJson = 
{
  "sgglegis":{}
};
var jsonObj = [] ;
var jsonTemplate = fs.readFileSync('./helpers/jsonTemplate.json');
var pdfTemplate = fs.readFileSync('./helpers/pdfTemplate.json');

//Load Page
await driver.get(url);
await driver.findElement(By.css(pageLoaded));

for( row of (await getAllTitles(driver, titlesRows))){
  let title = await row.findElement(By.css('td:nth-child(2) a'));
  if(await title.getAttribute('href') === blankLink) {continue};

  var newJson = await JSON.parse(jsonTemplate);
  await newJson.lawProject.pdf.push(JSON.parse(pdfTemplate));
  
  newJson.lawProject.pdf[0].name = await title.getText();
  newJson.lawProject.pdf[0].link = await title.getAttribute('href');
  newJson.lawProject.pdf[0].date = "undefined";
    
  let initiator = await row.findElement(By.css("td:first-child a"));
  newJson.lawProject.name = await initiator.getText();
  
  jsonObj.push(await Promise.resolve(newJson));
}

secretariatJson["sgglegis"] = jsonObj;
console.log(JSON.stringify(secretariatJson,null,'\t'));

//write file
if (!fs.existsSync('../downloads/')){
  fs.mkdirSync('../downloads/');
}
fs.writeFile('../downloads/sgglegis.txt', JSON.stringify(secretariatJson,null,'\t'), err => {
  if (err) console.error(err);
});

await driver.quit();
}

function DriverBuilder() {
  let firefoxOptions = new firefox.Options();
  firefoxOptions.setPreference("browser.download.folderList", 2);
  firefoxOptions.setPreference("pdfjs.disabled", true);
  firefoxOptions.setPreference("browser.download.dir", "../downloads");
  let driver = new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(firefoxOptions)
    .build();
  return driver;
}

function getAllTitles(driver, titlesRows){
    return driver.findElements(By.css(titlesRows)).then(function(title){
        var allPromises = title.map(function(title){
            return title;
        });
        return Promise.all(allPromises);
    });     
  }
main()