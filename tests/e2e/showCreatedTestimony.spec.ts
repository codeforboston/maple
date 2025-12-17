// import { test, expect, Page, Locator, Browser } from "@playwright/test"
// import { CreateTestimony } from "./page_objects/createTestimony"
// import { userLogin, setupPage } from "./utils/login"
// import { getByRole } from "@testing-library/dom"
// import { regex } from "react-admin"
// require("dotenv").config()

// /**
//  * @param USER_EMAIL
//  * @param USER_PASSWORD
//  * @returns
//  */

// const USER_EMAIL = process.env.TEST_USER_USERNAME
// const USER_PASSWORD = process.env.TEST_USER_PASSWORD

// test.describe
//   .serial("Create testimony, show on Browse Testimonies , written by user when setting is private", () => {

//   test("Creates testinomy", async ({ browser }) => {
//     const context = await browser.newContext()
//     const page = await context.newPage()

//     await userLogin(page, USER_EMAIL, USER_PASSWORD)

//     await page.goto("http://localhost:3000/edit-profile/about-you")

//     const createTestimony = new CreateTestimony(page)

//     await createTestimony.toBills.click()

//     await createTestimony.removePresetCourtfilter()

//    const isBill =page.getByRole('link', { name: /^Court/ }).last();

//    const billName = (await isBill.textContent({timeout:30000}))!

//    console.log({billName}, typeof(billName))

//   const billPattern = /.*?(H\.\d+)/;

//   const matchResult = billName.match(billPattern);

//   let billNumber: string;

//   if (matchResult && matchResult[1]) {
//       billNumber = matchResult[1];
//       console.log(`Extracted Bill Number: ${billNumber}`);
//   } else {
//       billNumber = 'NOT_FOUND';
//       console.warn("Could not find the bill number pattern (H.####) in the link name.");
//   }

//    await isBill.click()

//    expect(page.getByText(billName))

//    page.getByRole('link', {name:'More Details'}).click()

//    page.getByRole('link', {name: /^Add Testimony for/}).click() // try with exact name, difficulty fiinding

//    //click oppose
//    const opposeButton = page.locator('div').filter( {hasText: /^Oppose$/ }).first()
//    await expect(opposeButton).toBeVisible({ timeout: 15000 });
//    await opposeButton.click();

//    page.waitForTimeout(200)

//   //click next
//    await expect(createTestimony.next).toBeEnabled({ timeout: 15000 });
//    await createTestimony.next.click()

//    //select legislators
//    expect(page.getByText('Select Your Legislators')).toBeVisible({timeout:30000})

//  //click next
//   await page.getByRole('button',{name: 'Next >>'}).click()

//                              // expect(page.getByPlaceholder('Write Your Testimony Email'))//failing

//  //write testimony
//   await page.getByPlaceholder('Add your testimony here').click()
//   const sampleTestimony = 'This is my sample testimony.'
//   page.waitForTimeout(200)
//   await createTestimony.writeTestimony.fill(sampleTestimony)

//   //Next
//   await page.getByRole('button',{name: 'Next >>'}).click()
//                           // expect(createTestimony.next).toBeEnabled()// do i need this?

//   expect(createTestimony).toContain('Confirm and Send')

//    page.getByRole('button', { name: 'Publish'}).click()

//    page.getByRole('button', {  name:'Finished! Back to Bill'}).click()

//    //verify privacy and testimony on profile page

//    await page.goto("http://localhost:3000/edit-profile/about-you")

//    const settingsButton = page.getByRole("button", {
//         name: "settings",
//         exact: true
//       })

//       await expect(settingsButton).toBeEnabled({ timeout: 10000 })

//       await settingsButton.click()
//       //Verify privacy setting is private
//       const isPrivate = page.getByText('Your profile is currently private')

//       await isPrivate.isVisible({timeout:30000})

//       page.getByRole( 'button', { name: 'Cancel'}).click()

//       //verify testimony present on profile page
//       page.getByRole('tab', { name:'Testimonies'}).click()

//       expect(createTestimony).toContain(billName)

//       //veify testimony present on Browse Testimony page
//       await createTestimony.toBills.click()

//       const sectionLocator = page.locator('.px-4 > .py-3');

//       const targetSection = sectionLocator.filter({
//           hasText: billName
//       });

//       await targetSection.getByRole('link', { name: 'More details' }).click();

//       //verify Written By anonymous

//       const isAnonymouseOne = page.getByText('Anonymous opposes this policy')

//       await expect(isAnonymouseOne).toBeVisible()

//       await createTestimony.toBills.click()

//       const isAnonymouseTwo = page.getByRole('link', { name: `Profile Icon Written by anonymous Oppose Bill #${billName} An Act relative to`})

//       await expect(isAnonymouseTwo).toBeVisible()

//       page.close()

//       // page.getByRole('heading',{ name:'Published Testimonies'})

//   })

// })
