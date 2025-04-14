#!/bin/bash

tag="v2"
docker buildx build --platform linux/amd64 -t social-insights-be .
docker tag social-insights-be ajitborude/social-insights-be:$tag
docker push ajitborude/social-insights-be:$tag
