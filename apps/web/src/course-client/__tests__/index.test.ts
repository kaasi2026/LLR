import { get_course, get_skill_data, get_skill_introduction, loadMarkdownIntroduction } from "../index"

describe("get_course", () => {
  it("returns correct course data", async () => {
    expect(await get_course({ courseName: "test-1" })).toMatchSnapshot(
      "test course data"
    )
  })

})

describe("get_skill_data", () => {
  it("returns correct course data", async () => {
    expect(
      await get_skill_data({ courseName: "test-1", skillName: "animals" })
    ).toMatchSnapshot()
  })

})

describe("get_skill_introduction", () => {
  it("returns correct course data", async () => {
    expect(
      await get_skill_introduction({
        courseName: "test-1",
        skillName: "animals",
      })
    ).toMatchInlineSnapshot(`
      {
        "courseName": "test-1",
        "practiceHref": "animals",
        "readmeHTML": undefined,
        "skillName": "animals",
        "title": "Animals",
      }
    `)
  })

  it("falls back gracefully when introduction markdown cannot be loaded", async () => {
    await expect(
      loadMarkdownIntroduction({
        courseName: "test-1",
        introductionPath: "introduction/missing.md",
        readFile: async () => {
          throw new Error("missing file")
        },
        importModule: async () => {
          throw new Error("missing module")
        },
      })
    ).resolves.toBe("")
  })

})
