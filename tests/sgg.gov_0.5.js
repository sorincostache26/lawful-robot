const {By,Key,Builder,until, WebElement} = require("selenium-webdriver");
const fs = require('fs');
require("geckodriver");
const firefox = require('selenium-webdriver/firefox');

async function main() {  
   //selectors
  var url = "https://sgg.gov.ro/1/anunturi-proiecte-de-acte-normative/";
  var pageLoaded = '#footer-col1 .footer-widget-title';
  var panel = '.panel-body .pt-cv-content *';

let driver = DriverBuilder();

//JSON init
let secretariatJson = 
{
  "sgg.gov":{}
};
var jsonObj = [] ;
var jsonTemplate = fs.readFileSync('./helpers/jsonTemplate.json');
var pdfTemplate = fs.readFileSync('./helpers/pdfTemplate.json');

//Load Page
await driver.get(url);
await driver.findElement(By.css(pageLoaded));

var oneTrueJson = JSON.parse(jsonTemplate);
oneTrueJson.lawProject.name = 'all of them' ;

for( row of (await getAllElements(driver, panel))){
  try{
      await row.findElement(By.css(' p>strong'));
  }
  catch{
    try{
      await row.findElement(By.css(' ul li'));

      var temp = await (await row.findElement(By.css('ul a[href*=".pdf"]'))).getAttribute('href');
      console.log('-------RABBIT is: ' + await temp);
      oneTrueJson.lawProject.pdf[oneTrueJson.lawProject.pdf.length - 1].link = temp;
      continue;
    }
    catch{
  continue;
    }
  };

  try {
    await row.findElement(By.css('a[href*=".pdf"]'));
    await row.findElement(By.css('a[href*=".doc"]'));

    var currentTitle =await buildTitle(row);
    if(currentTitle !== ''){
      console.log(currentTitle);
      await oneTrueJson.lawProject.pdf.push(JSON.parse(pdfTemplate));  
      oneTrueJson.lawProject.pdf[oneTrueJson.lawProject.pdf.length - 1].name = currentTitle;
    }

  }
  catch{
  }

}

jsonObj.push(await Promise.resolve(oneTrueJson));
secretariatJson["sgg.gov"] = jsonObj;
console.log(JSON.stringify(secretariatJson,null,'\t'));

//write file
if (!fs.existsSync('../downloads/')){
  fs.mkdirSync('../downloads/');
}
fs.writeFile('../downloads/sgg.gov.txt', JSON.stringify(secretariatJson,null,'\t'), err => {
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

function getAllElements(driver, container){
    return driver.findElements(By.css(container)).then(function(element){
        var allPromises = element.map(function(element){
            return element;
        });
        return Promise.all(allPromises);
    });     
  }

async function buildTitle(row){
  var titleString = '';
  titleString += await row.getText();
  // for(childElement of (await getAllElements(driver, row.findElements(By.css('>*'))))){
  //   titleString += childElement.getText();
  //   console.log("inner in");
  // }
  return titleString;
}

main()