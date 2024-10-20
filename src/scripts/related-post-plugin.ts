"use strict";

const assign = Object.assign;

/**
 * Adds a count property to an array of objects based on a search property.
 *
 * @param array - The array of objects to process.
 * @param searchProperty - The property to search for in the objects.
 * @param newProperty - The property to add a count to.
 * @returns A new array with the count property added.
 */
function addCount<T extends Record<string, any>>(
  array: T[],
  searchProperty: keyof T,
  newProperty: string
): T[] & { [key: string]: number }[] {
  return array.reduce((newArray: T[] & { [key: string]: number }[], item: T) => {
    const i = objectArrayIndexOf(newArray, item[searchProperty], searchProperty);
    if (i === -1) {
      (item as any)[newProperty] = 1; // Use type assertion to bypass the index error
      newArray.push(item);
    } else {
      (newArray[i] as any)[newProperty] = (newArray[i][newProperty] as number) + 1; // Use type assertion here as well
    }
    return newArray;
  }, []);
}

/**
 * Finds the index of an object in an array based on a search term and property.
 *
 * @param array - The array of objects to search.
 * @param searchTerm - The term to search for.
 * @param property - The property to match against.
 * @returns The index of the object, or -1 if not found.
 */
function objectArrayIndexOf<T extends Record<string, any>>(array: T[], searchTerm: any, property: keyof T): number {
  for (let i = 0; i < array.length; i++) {
    if (array[i][property] === searchTerm) {
      return i;
    }
  }
  return -1;
}

/**
 * Creates a sorting function based on a property and order.
 *
 * @param property - The property to sort by.
 * @param isAscending - Whether to sort in ascending order.
 * @returns A comparison function for sorting.
 */
function dynamicSort<T>(property: keyof T, isAscending: boolean) {
  const sortOrder = isAscending ? 1 : -1;
  return function (a: T, b: T) {
    if (a[property] < b[property]) {
      return -1 * sortOrder;
    } else if (a[property] > b[property]) {
      return 1 * sortOrder;
    }
    return 0;
  };
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 *
 * @param array - The array to shuffle.
 * @returns The shuffled array.
 */
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let temporaryValue: T;
  let randomIndex: number;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

/**
 * Lists related posts based on the tags of a given post.
 *
 * @param _post - The post for which to find related posts.
 * @param options - Options for listing related posts.
 * @param _hexo - The hexo instance.
 * @returns An array of related posts.
 */
function listRelatedPosts(_post: any, options?: any, _hexo?: any): any[] {
  if (!options) {
    options = {};
  }
  options = assign(
    {
      maxCount: 5,
      orderBy: "date",
      isAscending: false
    },
    options
  );

  const orderOption = ["date", "random"];
  if (!orderOption.includes(options.orderBy)) {
    options.orderBy = "date";
  }

  let postList: any[] = [];

  _post.tags.each((tag: any) => {
    tag.posts.each((post: any) => {
      postList.push(post);
    });
  });

  postList = addCount(postList, "_id", "count");
  const thisPostPosition = objectArrayIndexOf(postList, _post._id, "_id");
  postList.splice(thisPostPosition, 1);

  if (options.orderBy === "random") {
    shuffle(postList);
  } else {
    postList.sort(dynamicSort(options.orderBy, options.isAscending));
  }

  postList.sort(dynamicSort("count", false));
  return postList;
}

hexo.extend.helper.register("list_related_posts", (post: any, options: any, hexo: any) => {
  return listRelatedPosts(post, options, hexo);
});
