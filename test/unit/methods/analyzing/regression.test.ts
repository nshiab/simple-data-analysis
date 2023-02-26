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
            { keyX: "x", keyY: "y", a: -1.1064, b: 14.0811, r2: 0.8731 },
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
            { keyX: "x", keyY: "y", a: 1.1071, b: 1, c: 0.5714, r2: 0.9884 },
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
                keyX: "x",
                keyY: "y",
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
            { keyX: "x", keyY: "y", a: 3.0331, b: 0.6909, r2: 0.9984 },
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
            { keyX: "x", keyY: "y", a: 0.8808, b: 4.1734, r2: 0.9584 },
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
            { keyX: "rank", keyY: "sales", a: 108.7538, b: -0.627, r2: 0.832 },
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
            { keyX: "key1", keyY: "key2", a: 2, b: 0, r2: 1 },
            { keyX: "key1", keyY: "key3", a: 0.0149, b: 3.3905, r2: 0.8176 },
            { keyX: "key2", keyY: "key3", a: 0.0074, b: 3.3905, r2: 0.8176 },
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
            { keyX: "key1", keyY: "key2", a: 2, b: 0, r2: 1 },
            { keyX: "key1", keyY: "key3", a: 0.0149, b: 3.3905, r2: 0.8176 },
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
            { keyX: "key1", keyY: "key2", a: 2, b: 0, r2: 1 },
            { keyX: "key1", keyY: "key3", a: 0.0149, b: 3.3905, r2: 0.8176 },
            { keyX: "key2", keyY: "key3", a: 0.0074, b: 3.3905, r2: 0.8176 },
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
            2
        )
        assert.deepEqual(regressionData, [
            { keyX: "key1", keyY: "key2", a: 2, b: 0, r2: 1 },
            { keyX: "key1", keyY: "key3", a: 0.01, b: 3.39, r2: 0.82 },
            { keyX: "key2", keyY: "key3", a: 0.01, b: 3.39, r2: 0.82 },
        ])
    })
})
