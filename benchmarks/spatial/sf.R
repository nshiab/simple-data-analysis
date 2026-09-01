suppressPackageStartupMessages({
  library(dplyr)
  library(readr)
  library(sf)
})
invisible(sf_use_s2(FALSE))

required_environment <- function(name) {
  value <- Sys.getenv(name, unset = NA_character_)
  if (is.na(value) || value == "") {
    stop(paste("Missing required environment variable", name))
  }
  value
}

trees_input <- required_environment("BENCHMARK_INPUT")
neighbourhoods_input <- required_environment("BENCHMARK_POLYGONS")
result_output <- required_environment("BENCHMARK_RESULT_OUTPUT")

trees <- read_csv(
  trees_input,
  col_select = c(Longitude, Latitude),
  show_col_types = FALSE
) %>%
  filter(!is.na(Longitude), !is.na(Latitude)) %>%
  st_as_sf(coords = c("Longitude", "Latitude"), crs = 4326)
neighbourhoods <- st_read(
  neighbourhoods_input,
  query = "SELECT nom_qr FROM quartierreferencehabitation",
  quiet = TRUE
)
joined <- st_join(trees, neighbourhoods, join = st_covered_by, left = FALSE)
result <- joined %>%
  st_drop_geometry() %>%
  count(nom_qr, name = "count") %>%
  arrange(nom_qr)

write.csv(result, result_output, row.names = FALSE, quote = TRUE)
