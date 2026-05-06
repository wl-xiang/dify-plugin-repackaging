#!/bin/bash

# 配置变量
# 路径映射: /app ==> ./
PLATFORM="manylinux_2_17_x86_64"
ADDON_REQUIREMENTS_FILE="/app/addons.txt"
COMMAND="local"
PLUGIN_PATH="/app/plugins/bowenliang123-md_exporter_3.6.9.difypkg"

# 构建命令
RUN_CMD="./plugin_repackaging.sh \
    -p $PLATFORM \
    -r $ADDON_REQUIREMENTS_FILE \
    $COMMAND \
    $PLUGIN_PATH"

docker run \
    -v $(pwd):/app \
    dify-plugin-repackaging \
    $RUN_CMD
