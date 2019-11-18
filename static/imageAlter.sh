#!/bin/bash

vips find_trim images/pokemon_icon_008_00_shiny.png --background 0 --threshold 20)

grep pattern file | awk '{print}' ORS=' '
