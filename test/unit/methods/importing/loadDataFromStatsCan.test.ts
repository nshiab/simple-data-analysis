import assert from "assert"
import { SimpleDataNode } from "../../../../src/index.js"

describe("loadDataFromStatsCan", function () {
    it("should return an array of objects from a table id", async function () {
        const sd = await new SimpleDataNode().loadDataFromStatsCan({
            pid: "9810000101",
            lastItem: 0,
        })
        // Weird formatting
        sd.formatAllKeys()
        assert.deepStrictEqual(sd.getData(), [
            {
                refDate: "2021",
                geo: "Canada",
                dguid: "2021A000011124",
                coordinate: "1",
                populationAndDwellingCounts11Population20211: "36991981",
                symbols: "",
                populationAndDwellingCounts11Population20162: "35151728",
                populationAndDwellingCounts11PopulationPercentageChange2016To20213:
                    "5.2",
                populationAndDwellingCounts11TotalPrivateDwellings20214:
                    "16284235",
                populationAndDwellingCounts11TotalPrivateDwellings20165:
                    "15412443",
                populationAndDwellingCounts11TotalPrivateDwellingsPercentageChange2016To20216:
                    "5.7",
                populationAndDwellingCounts11PrivateDwellingsOccupiedByUsualResidents20217:
                    "14978941",
                populationAndDwellingCounts11PrivateDwellingsOccupiedByUsualResidents20168:
                    "14072079",
                populationAndDwellingCounts11PrivateDwellingsOccupiedByUsualResidentsPercentageChange2016To20219:
                    "6.4",
                populationAndDwellingCounts11LandAreaInSquareKilometres202110:
                    "8788702.80",
                populationAndDwellingCounts11PopulationDensityPerSquareKilometre202111:
                    "4.2",
            },
        ])
    })
    it("should return an array of objects from a table id in French", async function () {
        const sd = await new SimpleDataNode().loadDataFromStatsCan({
            pid: "9810000101",
            lang: "fr",
            lastItem: 0,
        })
        // Weird formatting
        sd.formatAllKeys()
        assert.deepStrictEqual(sd.getData(), [
            {
                periodeDeReferenceGeoDguidCoordonneeChiffresDePopulationEtDesLogements11Population:
                    "2021",
                "20211SymbolesChiffresDePopulationEtDesLogements11Population":
                    "Canada",
                "20162SymbolesChiffresDePopulationEtDesLogements11VariationEnPourcentageDeLaPopulation":
                    "2021A000011124",
                "2016A20213SymbolesChiffresDePopulationEtDesLogements11TotalDesLogementsPrives":
                    "1",
                "20214SymbolesChiffresDePopulationEtDesLogements11TotalDesLogementsPrives":
                    "36991981",
                "20165SymbolesChiffresDePopulationEtDesLogements11VariationEnPourcentageDuTotalDesLogementsPrives":
                    ';"35151728";;"5.2";;"16284235";;"15412443";;"5.7";;"14978941";;"14072079";;"6.4";;"8788702.80";;"4.2";',
                "2016A20216SymbolesChiffresDePopulationEtDesLogements11LogementsPrivesOccupesParDesResidentsHabituels":
                    "",
                "20217SymbolesChiffresDePopulationEtDesLogements11LogementsPrivesOccupesParDesResidentsHabituels":
                    "",
                "20168SymbolesChiffresDePopulationEtDesLogements11VariationEnPourcentageDesLogementsPrivesOccupesParDesResidentsHabituels":
                    "",
                "2016A20219SymbolesChiffresDePopulationEtDesLogements11SuperficieDesTerresEnKilometresCarres":
                    "",
                "202110SymbolesChiffresDePopulationEtDesLogements11DensiteDePopulationAuKilometreCarre":
                    "",
                "202111Symboles": "",
            },
        ])
    })
})
