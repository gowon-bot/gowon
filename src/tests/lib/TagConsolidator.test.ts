import anyTest, { TestInterface } from "ava";
import { TagConsolidator } from "../../lib/TagConsolidator";
import { Tag } from "../../services/LastFM/LastFMService.types";

const test = anyTest as TestInterface<{ consolidator: TagConsolidator }>;

function createTags(tags: string[]): Tag[] {
  return tags.map((t) => ({
    name: t,
    url: `https://last.fm/tag/${t}`,
  }));
}

test.beforeEach((t) => {
  t.context.consolidator = new TagConsolidator();
});

test("should all return tags", async (t) => {
  let tags = ["tag1", "tag2", "tag3", "tag4"];

  t.context.consolidator.addTags(createTags(tags));

  let consolidated = t.context.consolidator.consolidate();

  t.deepEqual(consolidated, tags);
});

test("should limit the tags with a limit", async (t) => {
  let tags = ["tag1", "tag2", "tag3", "tag4"];

  t.context.consolidator.addTags(createTags(tags));

  let consolidated = t.context.consolidator.consolidate(2);

  t.deepEqual(consolidated, ["tag1", "tag2"]);
});

test("should sort by the number of occurances", async (t) => {
  let tags1 = ["tag2", "tag3", "tag4", "tag1", "tag1"];
  let tags2 = ["tag2", "tag2", "tag1", "tag2", "tag3", "tag4", "tag1", "tag3"];

  let consolidator1 = new TagConsolidator().addTags(createTags(tags1));
  let consolidator2 = new TagConsolidator().addTags(createTags(tags2));

  let consolidated1 = consolidator1.consolidate();
  let consolidated2 = consolidator2.consolidate();

  t.deepEqual(consolidated1, ["tag1", "tag2", "tag3", "tag4"]);
  t.deepEqual(consolidated2, ["tag2", "tag1", "tag3", "tag4"]);
});

test("should combine similar tags", async (t) => {
  let tags = ["tag1", "tag-1", "tag 1", "tag_1", "tag2"];

  t.context.consolidator.addTags(createTags(tags));

  let consolidated = t.context.consolidator.consolidate();

  t.deepEqual(consolidated, ["tag1", "tag2"]);
});

test("should filter bad tags", async (t) => {
  let badtags = ["bad tag"];
  let tags = ["tag1", "bad tag", "tag2"];

  t.context.consolidator.blacklistedTags = badtags;
  t.context.consolidator.addTags(createTags(tags));

  let consolidated = t.context.consolidator.consolidate();

  t.deepEqual(consolidated, ["tag1", "tag2"]);
});

test("should filter long tags", async (t) => {
  let longtag = "a".repeat(t.context.consolidator.characterLimit + 1);
  let tags = ["tag1", longtag, "tag2"];

  t.context.consolidator.addTags(createTags(tags));

  let consolidated = t.context.consolidator.consolidate();

  t.deepEqual(consolidated, ["tag1", "tag2"]);
});

test("should not filter long tags if disabled", async (t) => {
  let longtag = "a".repeat(t.context.consolidator.characterLimit + 1);
  let tags = ["tag1", longtag, "tag2"];

  t.context.consolidator.addTags(createTags(tags));

  let consolidated = t.context.consolidator.consolidate(Infinity, false);

  t.deepEqual(consolidated, ["tag1", longtag, "tag2"]);
});
