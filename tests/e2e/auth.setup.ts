import { test as setup, expect } from "@playwright/test"

const authFile = "playwright/.auth/user.json"

setup("authenticate", async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto("http://localhost:3000")
  await page.getByRole("button", { name: "Log in / Sign up" }).click()
  await page.getByRole("button", { name: "Sign In", exact: true }).click()
  await page.getByPlaceholder("email").fill("testadmin@example.com")
  await page.getByPlaceholder("password").fill("password")
  await page.click('button[type="submit"]')
  await expect(page.getByAltText("profile icon")).toBeVisible()
  //   // Alternatively, you can wait until the page reaches a state where all cookies are set.
  //   await expect(page.getByAltText("profile icon")).toBeVisible()
  //   // End of authentication steps.

  //   await page.context().storageState({ path: authFile })

  await page.evaluate(async () => {
    window.localStorage.clear()
    window.sessionStorage.clear()

    const indexedDB = window.indexedDB
    const dbs = await indexedDB.databases()

    for (let dbIndex = 0; dbIndex < dbs.length; dbIndex++) {
      const dbInfo = dbs[dbIndex]
      const db: IDBDatabase = await new Promise((resolve, reject) => {
        let req = indexedDB.open(dbInfo.name as string, dbInfo.version)
        req.onsuccess = (event: any) => {
          resolve(event.target.result)
        }
        req.onupgradeneeded = (event: any) => {
          resolve(event.target.result)
        }
        req.onerror = e => {
          reject(e)
        }
      })

      let dbRes: { [k: string]: any } = {}

      for (
        let objectStorageIndex = 0;
        objectStorageIndex < db.objectStoreNames.length;
        objectStorageIndex++
      ) {
        const objectStorageName = db.objectStoreNames[objectStorageIndex]
        let objectStorageRes: { [k: string]: any } = {}

        // Open a transaction to access the firebaseLocalStorage object store
        const transaction = db.transaction([objectStorageName], "readonly")
        const objectStore = transaction.objectStore(objectStorageName)

        // Get all keys and values from the object store
        const getAllKeysRequest = objectStore.getAllKeys()
        const getAllValuesRequest = objectStore.getAll()

        const keys: any = await new Promise((resolve, reject) => {
          getAllKeysRequest.onsuccess = (event: any) => {
            resolve(event.target.result)
          }
          getAllKeysRequest.onerror = e => {
            reject(e)
          }
        })

        const values: any = await new Promise((resolve, reject) => {
          getAllValuesRequest.onsuccess = (event: any) => {
            resolve(event.target.result)
          }
          getAllValuesRequest.onerror = e => {
            reject(e)
          }
        })

        for (let i = 0; i < keys.length; i++) {
          objectStorageRes[keys[i]] = JSON.stringify(values[i])
        }

        dbRes[objectStorageName] = objectStorageRes
      }
      localStorage.setItem(db.name, JSON.stringify(dbRes))
    }
  })

  await page.context().storageState({ path: authFile })
})
