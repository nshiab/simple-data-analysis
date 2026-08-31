suppressPackageStartupMessages({
  library(dplyr)
  library(lubridate)
  library(readr)
})

required_environment <- function(name) {
  value <- Sys.getenv(name, unset = NA_character_)
  if (is.na(value) || value == "") {
    stop(paste("Missing required environment variable", name))
  }
  value
}

input_path <- required_environment("BENCHMARK_INPUT")
clean_output <- required_environment("BENCHMARK_CLEAN_OUTPUT")
result_output <- required_environment("BENCHMARK_RESULT_OUTPUT")

temperatures <- read_csv(
  input_path,
  col_types = cols(.default = col_character()),
  col_select = c(time, station, station_name, tas)
) %>%
  filter(!is.na(tas)) %>%
  mutate(
    tas = as.numeric(tas),
    time = as.Date(time),
    decade = as.integer(floor(year(time) / 10) * 10)
  )

write_csv(temperatures, clean_output)

result <- temperatures %>%
  group_by(station, station_name, decade) %>%
  summarize(mean = mean(tas), .groups = "drop") %>%
  arrange(station, station_name, decade)

write_csv(result, result_output)
