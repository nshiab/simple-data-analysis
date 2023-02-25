// from https://observablehq.com/@harrystevens/introducing-d3-regression

import assert from "assert"
import regression from "../../../../src/methods/analyzing/regression.js"

describe("regression", function () {
    it("should apply linear regression", function () {
        const data = [
            { x: 8, y: 3 },
            { x: 2, y: 10 },
            { x: 11, y: 3 },
            { x: 6, y: 6 },
            { x: 5, y: 8 },
            { x: 4, y: 12 },
            { x: 12, y: 1 },
            { x: 9, y: 4 },
            { x: 6, y: 9 },
            { x: 1, y: 14 },
        ]
        const regressionData = regression(data, "x", "y")
        assert.deepEqual(regressionData, [
            { key1: "x", key2: "y", a: -1.1064, b: 14.0811, r2: 0.8731 },
        ])
    })

    it("should apply quadratic regression", function () {
        const data = [
            { x: -3, y: 7.5 },
            { x: -2, y: 3 },
            { x: -1, y: 0.5 },
            { x: 0, y: 1 },
            { x: 1, y: 3 },
            { x: 2, y: 6 },
            { x: 3, y: 14 },
        ]
        const regressionData = regression(data, "x", "y", "quadratic")
        assert.deepEqual(regressionData, [
            { key1: "x", key2: "y", a: 1.1071, b: 1, c: 0.5714, r2: 0.9884 },
        ])
    })

    it("should apply polynomial regression", function () {
        const data = [
            { x: 0, y: 140 },
            { x: 1, y: 149 },
            { x: 2, y: 159.6 },
            { x: 3, y: 159 },
            { x: 4, y: 155.9 },
            { x: 5, y: 169 },
            { x: 6, y: 162.9 },
            { x: 7, y: 169 },
            { x: 8, y: 180 },
        ]
        const regressionData = regression(data, "x", "y", "polynomial", 3)
        assert.deepEqual(regressionData, [
            {
                key1: "x",
                key2: "y",
                a: 0.2417,
                b: -2.9952,
                c: 13.4536,
                d: 139.7667,
                r2: 0.9204,
            },
        ])
    })

    it("should apply exponential regression", function () {
        const data = [
            { x: 0, y: 3 },
            { x: 1, y: 7 },
            { x: 2, y: 10 },
            { x: 3, y: 24 },
            { x: 4, y: 50 },
            { x: 5, y: 95 },
        ]
        const regressionData = regression(data, "x", "y", "exponential")
        assert.deepEqual(regressionData, [
            { key1: "x", key2: "y", a: 3.0331, b: 0.6909, r2: 0.9984 },
        ])
    })

    it("should apply logarithmic regression", function () {
        const data = [
            { x: 1, y: 4.181 },
            { x: 2, y: 4.665 },
            { x: 3, y: 5.296 },
            { x: 4, y: 5.365 },
            { x: 5, y: 5.448 },
            { x: 6, y: 5.744 },
            { x: 7, y: 5.653 },
            { x: 8, y: 5.844 },
            { x: 9, y: 6.362 },
            { x: 10, y: 6.38 },
            { x: 11, y: 6.311 },
            { x: 12, y: 6.457 },
            { x: 13, y: 6.479 },
            { x: 14, y: 6.59 },
            { x: 15, y: 6.74 },
            { x: 16, y: 6.58 },
            { x: 17, y: 6.852 },
            { x: 18, y: 6.531 },
            { x: 19, y: 6.682 },
            { x: 20, y: 7.013 },
            { x: 21, y: 6.82 },
            { x: 22, y: 6.647 },
            { x: 23, y: 6.951 },
            { x: 24, y: 7.121 },
            { x: 25, y: 7.143 },
            { x: 26, y: 6.914 },
            { x: 27, y: 6.941 },
            { x: 28, y: 7.226 },
            { x: 29, y: 6.898 },
            { x: 30, y: 7.392 },
            { x: 31, y: 6.938 },
        ]
        const regressionData = regression(data, "x", "y", "logarithmic")
        assert.deepEqual(regressionData, [
            { key1: "x", key2: "y", a: 0.8808, b: 4.1734, r2: 0.9584 },
        ])
    })

    it("should apply power law regression", function () {
        const data = [
            { game: "Wii Sports", rank: 1, sales: 82.74 },
            { game: "Super Mario Bros.", rank: 2, sales: 40.24 },
            { game: "Mario Kart Wii", rank: 3, sales: 35.82 },
            { game: "Wii Sports Resort", rank: 4, sales: 33 },
            { game: "Pokemon Red/Pokemon Blue", rank: 5, sales: 31.37 },
            { game: "Tetris", rank: 6, sales: 30.26 },
            { game: "New Super Mario Bros.", rank: 7, sales: 30.01 },
            { game: "Wii Play", rank: 8, sales: 29.02 },
            { game: "New Super Mario Bros. Wii", rank: 9, sales: 28.62 },
            { game: "Duck Hunt", rank: 10, sales: 28.31 },
            {
                game: "Brain Age: Train Your Brain in Minutes a Day",
                rank: 20,
                sales: 20.22,
            },
            { game: "Call of Duty: Modern Warfare 3", rank: 30, sales: 14.76 },
            { game: "Super Smash Bros. Brawl", rank: 40, sales: 13.04 },
            {
                game: "Pokemon Omega Ruby/Pokemon Alpha Sapphire",
                rank: 50,
                sales: 11.33,
            },
            { game: "Super Mario 64", rank: 60, sales: 10.42 },
            { game: "Gran Turismo 2", rank: 70, sales: 9.49 },
            { game: "Halo 2", rank: 80, sales: 8.49 },
            { game: "Pac-Man", rank: 90, sales: 7.81 },
            { game: "Battlefield 3", rank: 100, sales: 7.34 },
            { game: "FIFA Soccer 11", rank: 200, sales: 5.08 },
            { game: "Fallout 3", rank: 300, sales: 4.01 },
            {
                game: "Professor Layton and the Unwound Future",
                rank: 400,
                sales: 3.36,
            },
            { game: "Hot Shots Golf 3", rank: 500, sales: 2.89 },
            { game: "Dragon Age: Origins", rank: 600, sales: 2.57 },
            { game: "Just Dance 2015", rank: 700, sales: 2.28 },
            { game: "Metal Gear Solid: Peace Walker", rank: 800, sales: 2.09 },
            { game: "The Sims: Makin' Magic", rank: 900, sales: 1.92 },
            {
                game: "2 Games in 1 Double Pack: The Incredibles / Finding Nemo: The Continuing Adventures",
                rank: 1000,
                sales: 1.76,
            },
            { game: "Heavenly Sword", rank: 1100, sales: 1.66 },
            { game: "Active Life: Outdoor Challenge", rank: 1200, sales: 1.55 },
            {
                game: "The SpongeBob SquarePants Movie",
                rank: 1300,
                sales: 1.46,
            },
            { game: "Deus Ex: Human Revolution", rank: 1400, sales: 1.39 },
            { game: "LEGO Batman: The Videogame", rank: 1500, sales: 1.32 },
            { game: "Baldur's Gate: Dark Alliance", rank: 1600, sales: 1.24 },
            { game: "FIFA 14", rank: 1700, sales: 1.19 },
            { game: "Guitar Hero 5", rank: 1800, sales: 1.14 },
            { game: "Fisherman's Bass Club", rank: 1900, sales: 1.08 },
            {
                game: "Dance Dance Revolution SuperNOVA",
                rank: 2000,
                sales: 1.04,
            },
            { game: "Guitar Hero: Aerosmith", rank: 2100, sales: 0.99 },
            {
                game: "The SpongeBob SquarePants Movie",
                rank: 2200,
                sales: 0.94,
            },
            { game: "SOCOM 4: U.S. Navy SEALs", rank: 2300, sales: 0.9 },
            { game: "Wizards of Waverly Place", rank: 2400, sales: 0.87 },
            { game: "I Spy: Fun House", rank: 2500, sales: 0.83 },
            { game: "The Walking Dead: Season One", rank: 2600, sales: 0.79 },
            { game: "SoulCalibur V", rank: 2700, sales: 0.76 },
            { game: "Yoshi", rank: 2800, sales: 0.73 },
            { game: "NBA Live 09", rank: 2900, sales: 0.71 },
            { game: "Red Steel", rank: 3000, sales: 0.68 },
            { game: "The Evil Within", rank: 3100, sales: 0.65 },
            { game: "Disney Universe", rank: 3200, sales: 0.63 },
            { game: "Cooking Mama 4: Kitchen Magic!", rank: 3300, sales: 0.61 },
            { game: "Total War: Shogun 2", rank: 3400, sales: 0.59 },
            { game: "Tetris Party Deluxe", rank: 3500, sales: 0.58 },
            { game: "Lips: Number One Hits", rank: 3600, sales: 0.56 },
            {
                game: "System 3 presents Ferrari Challenge Trofeo Pirelli",
                rank: 3700,
                sales: 0.54,
            },
            { game: "Alice in Wonderland", rank: 3800, sales: 0.53 },
            { game: "Summoner", rank: 3900, sales: 0.51 },
            { game: "Cars 2", rank: 4000, sales: 0.5 },
            { game: "You're in the Movies", rank: 4100, sales: 0.48 },
            { game: "Need for Speed Carbon", rank: 4200, sales: 0.47 },
            { game: "iCarly", rank: 4300, sales: 0.46 },
            { game: "Sled Storm", rank: 4400, sales: 0.45 },
            { game: "Need for Speed Underground 2", rank: 4500, sales: 0.43 },
            {
                game: "SpongeBob's Truth or Square (US sales)",
                rank: 4600,
                sales: 0.42,
            },
            { game: "Destiny: The Taken King", rank: 4700, sales: 0.41 },
            { game: "WipeOut 3 The Game", rank: 4800, sales: 0.4 },
            { game: "NBA Live 09", rank: 4900, sales: 0.39 },
            { game: "The Cat in the Hat", rank: 5000, sales: 0.38 },
        ]
        const regressionData = regression(data, "rank", "sales", "power")
        assert.deepEqual(regressionData, [
            { key1: "rank", key2: "sales", a: 108.7538, b: -0.627, r2: 0.832 },
        ])
    })

    it("should apply loess regression", function () {
        const data = [
            { year: 1900, temperature: 57.5605 },
            { year: 1901, temperature: 57.3214 },
            { year: 1902, temperature: 56.2134 },
            { year: 1903, temperature: 56.317 },
            { year: 1904, temperature: 57.4467 },
            { year: 1905, temperature: 57.1332 },
            { year: 1906, temperature: 57.2392 },
            { year: 1907, temperature: 56.5545 },
            { year: 1908, temperature: 56.2721 },
            { year: 1909, temperature: 56.2912 },
            { year: 1910, temperature: 57.7532 },
            { year: 1911, temperature: 55.474 },
            { year: 1912, temperature: 55.5628 },
            { year: 1913, temperature: 56.5263 },
            { year: 1914, temperature: 57.4455 },
            { year: 1915, temperature: 56.8189 },
            { year: 1916, temperature: 55.5932 },
            { year: 1917, temperature: 56.6997 },
            { year: 1918, temperature: 56.9079 },
            { year: 1919, temperature: 56.3611 },
            { year: 1920, temperature: 56.1257 },
            { year: 1921, temperature: 57.3778 },
            { year: 1922, temperature: 56.1452 },
            { year: 1923, temperature: 56.4466 },
            { year: 1924, temperature: 57.1546 },
            { year: 1925, temperature: 57.206 },
            { year: 1926, temperature: 58.8471 },
            { year: 1927, temperature: 56.94 },
            { year: 1928, temperature: 57.7148 },
            { year: 1929, temperature: 57.3422 },
            { year: 1930, temperature: 56.9745 },
            { year: 1931, temperature: 58.3638 },
            { year: 1932, temperature: 56.9607 },
            { year: 1933, temperature: 56.8247 },
            { year: 1934, temperature: 59.7805 },
            { year: 1935, temperature: 56.8945 },
            { year: 1936, temperature: 58.6637 },
            { year: 1937, temperature: 57.2449 },
            { year: 1938, temperature: 57.3329 },
            { year: 1939, temperature: 58.4247 },
            { year: 1940, temperature: 58.8798 },
            { year: 1941, temperature: 57.1222 },
            { year: 1942, temperature: 57.1411 },
            { year: 1943, temperature: 57.894 },
            { year: 1944, temperature: 56.2842 },
            { year: 1945, temperature: 57.1573 },
            { year: 1946, temperature: 56.8022 },
            { year: 1947, temperature: 57.6003 },
            { year: 1948, temperature: 55.6891 },
            { year: 1949, temperature: 56.2792 },
            { year: 1950, temperature: 58.1899 },
            { year: 1951, temperature: 57.2899 },
            { year: 1952, temperature: 56.8036 },
            { year: 1953, temperature: 57.2433 },
            { year: 1954, temperature: 57.6142 },
            { year: 1955, temperature: 56.3011 },
            { year: 1956, temperature: 57.0172 },
            { year: 1957, temperature: 57.1288 },
            { year: 1958, temperature: 58.9603 },
            { year: 1959, temperature: 59.0416 },
            { year: 1960, temperature: 58.0866 },
            { year: 1961, temperature: 57.8652 },
            { year: 1962, temperature: 57.4384 },
            { year: 1963, temperature: 57.1077 },
            { year: 1964, temperature: 56.6202 },
            { year: 1965, temperature: 56.774 },
            { year: 1966, temperature: 58.0992 },
            { year: 1967, temperature: 57.5668 },
            { year: 1968, temperature: 57.5989 },
            { year: 1969, temperature: 57.5899 },
            { year: 1970, temperature: 57.8767 },
            { year: 1971, temperature: 56.2718 },
            { year: 1972, temperature: 57.2934 },
            { year: 1973, temperature: 57.3641 },
            { year: 1974, temperature: 57.7036 },
            { year: 1975, temperature: 56.3447 },
            { year: 1976, temperature: 57.5107 },
            { year: 1977, temperature: 58.0088 },
            { year: 1978, temperature: 57.6893 },
            { year: 1979, temperature: 57.7485 },
            { year: 1980, temperature: 58.1052 },
            { year: 1981, temperature: 59.3551 },
            { year: 1982, temperature: 56.4003 },
            { year: 1983, temperature: 57.6184 },
            { year: 1984, temperature: 58.2609 },
            { year: 1985, temperature: 57.3929 },
            { year: 1986, temperature: 58.9427 },
            { year: 1987, temperature: 58.3293 },
            { year: 1988, temperature: 58.7852 },
            { year: 1989, temperature: 58.1885 },
            { year: 1990, temperature: 58.0488 },
            { year: 1991, temperature: 58.16 },
            { year: 1992, temperature: 59.2918 },
            { year: 1993, temperature: 57.7408 },
            { year: 1994, temperature: 58.1055 },
            { year: 1995, temperature: 58.9677 },
            { year: 1996, temperature: 59.594 },
            { year: 1997, temperature: 59.1923 },
            { year: 1998, temperature: 56.7942 },
            { year: 1999, temperature: 58.0356 },
            { year: 2000, temperature: 58.8363 },
            { year: 2001, temperature: 59.2216 },
            { year: 2002, temperature: 58.8964 },
            { year: 2003, temperature: 59.529 },
            { year: 2004, temperature: 58.9128 },
            { year: 2005, temperature: 58.6833 },
            { year: 2006, temperature: 58.6975 },
            { year: 2007, temperature: 58.9929 },
            { year: 2008, temperature: 58.9459 },
            { year: 2009, temperature: 58.917 },
            { year: 2010, temperature: 57.7926 },
            { year: 2011, temperature: 57.5186 },
            { year: 2012, temperature: 59.5448 },
            { year: 2013, temperature: 59.3921 },
            { year: 2014, temperature: 61.5208 },
            { year: 2015, temperature: 60.7992 },
            { year: 2016, temperature: 60.1429 },
            { year: 2017, temperature: 60.4208 },
        ]
        const regressionData = regression(
            data,
            "year",
            "temperature",
            "loess",
            undefined,
            0.5
        )
        assert.deepEqual(regressionData, [
            { key1: "year", key2: "temperature" },
        ])
    })

    it("should compute all linear regressions if key1 and key2 are undefined", function () {
        const data = [
            { key1: 1, key2: 2, key3: 3 },
            { key1: 11, key2: 22, key3: 4 },
            { key1: 111, key2: 222, key3: 5 },
        ]
        const regressionData = regression(data)
        assert.deepEqual(regressionData, [
            { key1: "key1", key2: "key2", a: 2, b: 0, r2: 1 },
            { key1: "key1", key2: "key3", a: 0.0149, b: 3.3905, r2: 0.8176 },
            { key1: "key2", key2: "key3", a: 0.0074, b: 3.3905, r2: 0.8176 },
        ])
    })

    it("should compute multiple linear regressions if key2 is an array", function () {
        const data = [
            { key1: 1, key2: 2, key3: 3 },
            { key1: 11, key2: 22, key3: 4 },
            { key1: 111, key2: 222, key3: 5 },
        ]
        const regressionData = regression(data, "key1", ["key2", "key3"])
        assert.deepEqual(regressionData, [
            { key1: "key1", key2: "key2", a: 2, b: 0, r2: 1 },
            { key1: "key1", key2: "key3", a: 0.0149, b: 3.3905, r2: 0.8176 },
        ])
    })

    it("should compute all linear regressions if key1 is undefined and key2 is an empty array", function () {
        const data = [
            { key1: 1, key2: 2, key3: 3 },
            { key1: 11, key2: 22, key3: 4 },
            { key1: 111, key2: 222, key3: 5 },
        ]
        const regressionData = regression(data, undefined, [])
        assert.deepEqual(regressionData, [
            { key1: "key1", key2: "key2", a: 2, b: 0, r2: 1 },
            { key1: "key1", key2: "key3", a: 0.0149, b: 3.3905, r2: 0.8176 },
            { key1: "key2", key2: "key3", a: 0.0074, b: 3.3905, r2: 0.8176 },
        ])
    })

    it("should compute all linear regressions if key1 is undefined and key2 is an empty array, with only two decimals", function () {
        const data = [
            { key1: 1, key2: 2, key3: 3 },
            { key1: 11, key2: 22, key3: 4 },
            { key1: 111, key2: 222, key3: 5 },
        ]
        const regressionData = regression(
            data,
            undefined,
            [],
            "linear",
            undefined,
            undefined,
            2
        )
        assert.deepEqual(regressionData, [
            { key1: "key1", key2: "key2", a: 2, b: 0, r2: 1 },
            { key1: "key1", key2: "key3", a: 0.01, b: 3.39, r2: 0.82 },
            { key1: "key2", key2: "key3", a: 0.01, b: 3.39, r2: 0.82 },
        ])
    })
})
