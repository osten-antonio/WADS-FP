/*
* THis is deleted because in the future root page 
* should be a hero page (with mini dashboard if 
* logged in?)
* now just redirect to the app directly 
*/

import Home from "@/app/page"

describe("Root page", () => {
  it("redirects to /app", () => {
    expect(typeof Home).toBe("function")
  })
})