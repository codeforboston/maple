import { DataProvider } from "ra-core"

export const TestDataProvider = ():DataProvider => {
  return {
    getList: (resource, params) => {

      const p = Promise.resolve({
        data: [], 
        total: 0
      })
      
      return p
        
    },

    getOne: (resource, params) => {
    
      const p = Promise.resolve({
        data: undefined

      })
      return p
    },

    getMany: (resource, params) => Promise.resolve({ data: [] }),
    getManyReference: (resource, params) => Promise.resolve({ data: [], total: 0 }),
    create: (resource, params) => Promise.resolve({ data: undefined }),
    update: (resource, params) => Promise.resolve({ data: undefined }),
    updateMany: (resource, params) => Promise.resolve({ data: [] }),
    delete: (resource, params) => Promise.resolve({ data: undefined }),
    deleteMany: (resource, params) => Promise.resolve({ data: [] }),


  }
}


export default TestDataProvider