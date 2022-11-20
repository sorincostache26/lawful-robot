const {By,Key,Builder,until} = require("selenium-webdriver");
require("chromedriver");

const chromeDriver = require("selenium-webdriver/chrome");
const webdriver = require("selenium-webdriver");

async function cdepDownload(){
 
    var options = new chromeDriver.Options();
    options.setUserPreferences({
      "download.default_directory": "../",
      "pdfjs.disabled": true
    });
    
    var driver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

       var url = "http://cdep.ro/pls/caseta/eCaseta2015.OrdineZi";
       var searchString = "Automation testing with Selenium";

       //selectors
       var folderIcon = "[name='img4']";
       var pdfIcon = "a[href*='comisii/administratie'] [alt='PDF format']";
       var plNumberText = "a[href*='upl_pck2015.proiect?idp=20292']";
       var pageLogo = "[alt='Camera Deputatilor']";
       var dismissCookies = '[aria-label="dismiss cookie message"]';

       //To wait for browser to build and launch properly
       //let driver = await new Builder().forBrowser("chrome").build();

        await driver.get(url);
        await driver.findElement(By.css(dismissCookies)).click();
        await driver.get(url);
        await driver.findElement(By.css(pageLogo));
 
        let lawFolder = await driver.findElement(By.css(folderIcon));
        await driver.wait(until.elementIsVisible(lawFolder),1000);
        await lawFolder.click();

        let plNumberHolder = await driver.findElement(By.css(plNumberText));
        await driver.wait(until.elementIsVisible(plNumberHolder),1000);
        console.log('plNumber is: ', await plNumberHolder.getText());
        
        await driver.switchTo().frame(driver.findElement(By.css('#frame4')));
        
        let pdfToDownload = await driver.findElement(By.css(pdfIcon));
        await driver.wait(until.elementIsVisible(pdfToDownload),1000);
        await pdfToDownload.click();
        await driver.sleep(5000);
 
        //It is always a safe practice to quit the browser after execution
        // await driver.quit();
 
}
 
cdepDownload()