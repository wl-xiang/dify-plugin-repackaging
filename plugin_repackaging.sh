#!/bin/bash
# author: Junjie.M

DEFAULT_GITHUB_API_URL=https://github.com
DEFAULT_MARKETPLACE_API_URL=https://marketplace.dify.ai
# DEFAULT_PIP_MIRROR_URL=https://mirrors.aliyun.com/pypi/simple
DEFAULT_PIP_MIRROR_URL=https://pypi.org/simple/
TRUSTED_HOST="pypi.org"

GITHUB_API_URL="${GITHUB_API_URL:-$DEFAULT_GITHUB_API_URL}"
MARKETPLACE_API_URL="${MARKETPLACE_API_URL:-$DEFAULT_MARKETPLACE_API_URL}"
PIP_MIRROR_URL="${PIP_MIRROR_URL:-$DEFAULT_PIP_MIRROR_URL}"

CURR_DIR=`dirname $0`
cd $CURR_DIR
CURR_DIR=`pwd`
USER=`whoami`
ARCH_NAME=`uname -m`
OS_TYPE=$(uname)
OS_TYPE=$(echo "$OS_TYPE" | tr '[:upper:]' '[:lower:]')

CMD_NAME="dify-plugin-${OS_TYPE}-amd64"
if [[ "arm64" == "$ARCH_NAME" || "aarch64" == "$ARCH_NAME" ]]; then
	CMD_NAME="dify-plugin-${OS_TYPE}-arm64"
fi

PIP_PLATFORM=""
PACKAGE_SUFFIX="offline"

market(){
	if [[ -z "$2" || -z "$3" || -z "$4" ]]; then
		echo ""
		echo "Usage: "$0" market [plugin author] [plugin name] [plugin version]"
		echo "Example:"
		echo "	"$0" market junjiem mcp_sse 0.0.1"
		echo "	"$0" market langgenius agent 0.0.9"
		echo ""
		exit 1
	fi
	echo "From the Dify Marketplace downloading ..."
	PLUGIN_AUTHOR=$2
	PLUGIN_NAME=$3
	PLUGIN_VERSION=$4
	PLUGIN_PACKAGE_PATH=${CURR_DIR}/${PLUGIN_AUTHOR}-${PLUGIN_NAME}_${PLUGIN_VERSION}.difypkg
	PLUGIN_DOWNLOAD_URL=${MARKETPLACE_API_URL}/api/v1/plugins/${PLUGIN_AUTHOR}/${PLUGIN_NAME}/${PLUGIN_VERSION}/download
	echo "Downloading ${PLUGIN_DOWNLOAD_URL} ..."
	curl -L -o ${PLUGIN_PACKAGE_PATH} ${PLUGIN_DOWNLOAD_URL}
	if [[ $? -ne 0 ]]; then
		echo "Download failed, please check the plugin author, name and version."
		exit 1
	fi
	echo "Download success."
	repackage ${PLUGIN_PACKAGE_PATH}
}

github(){
	if [[ -z "$2" || -z "$3" || -z "$4" ]]; then
		echo ""
		echo "Usage: "$0" github [Github repo] [Release title] [Assets name (include .difypkg suffix)]"
		echo "Example:"
		echo "	"$0" github junjiem/dify-plugin-tools-dbquery v0.0.2 db_query.difypkg"
		echo "	"$0" github https://github.com/junjiem/dify-plugin-agent-mcp_sse 0.0.1 agent-mcp_see.difypkg"
		echo ""
		exit 1
	fi
	echo "From the Github downloading ..."
	GITHUB_REPO=$2
	if [[ "${GITHUB_REPO}" != "${GITHUB_API_URL}"* ]]; then
		GITHUB_REPO="${GITHUB_API_URL}/${GITHUB_REPO}"
	fi
	RELEASE_TITLE=$3
	ASSETS_NAME=$4
	PLUGIN_NAME="${ASSETS_NAME%.difypkg}"
	PLUGIN_PACKAGE_PATH=${CURR_DIR}/${PLUGIN_NAME}-${RELEASE_TITLE}.difypkg
	PLUGIN_DOWNLOAD_URL=${GITHUB_REPO}/releases/download/${RELEASE_TITLE}/${ASSETS_NAME}
	echo "Downloading ${PLUGIN_DOWNLOAD_URL} ..."
	curl -L -o ${PLUGIN_PACKAGE_PATH} ${PLUGIN_DOWNLOAD_URL}
	if [[ $? -ne 0 ]]; then
		echo "Download failed, please check the github repo, release title and assets name."
		exit 1
	fi
	echo "Download success."
	repackage ${PLUGIN_PACKAGE_PATH}
}

_local(){
	echo $2
	if [[ -z "$2" ]]; then
		echo ""
		echo "Usage: "$0" local [difypkg path or directory]"
		echo "Example:"
		echo "\t"$0" local ./db_query.difypkg"
		echo "\t"$0" local /root/dify-plugin/db_query.difypkg"
		echo "\t"$0" local ./plugins/"
		echo ""
		exit 1
	fi
	
	# 确保目标目录存在
	mkdir -p ${CURR_DIR}/flattens
	mkdir -p ${CURR_DIR}/offlines
	
	if [ -d "$2" ]; then
		# 处理目录下的所有 .difypkg 文件
		for pkg in "$2"/*.difypkg; do
			if [ -f "$pkg" ]; then
				PLUGIN_PACKAGE_PATH=`realpath $pkg`
				repackage ${PLUGIN_PACKAGE_PATH}
			fi
		done
	else
		# 处理单个文件
		PLUGIN_PACKAGE_PATH=`realpath $2`
		repackage ${PLUGIN_PACKAGE_PATH}
	fi
}

repackage(){
	local PACKAGE_PATH=$1
	PACKAGE_NAME_WITH_EXTENSION=`basename ${PACKAGE_PATH}`
	PACKAGE_NAME="${PACKAGE_NAME_WITH_EXTENSION%.*}"
	FLATTEN_DIR=${CURR_DIR}/flattens/${PACKAGE_NAME}
	OUTPUT_DIR=${CURR_DIR}/offlines
		echo "Unziping ..."
	install_unzip
	mkdir -p ${FLATTEN_DIR}
	unzip -o ${PACKAGE_PATH} -d ${FLATTEN_DIR}
	if [[ $? -ne 0 ]]; then
		echo "Unzip failed."
		exit 1
	fi
	echo "Unzip success."
	echo "Repackaging ..."
	cd ${FLATTEN_DIR}
	# Check if addon requirements file is provided and exists
	if [ -n "${ADDON_REQUIREMENTS_FILE}" ]; then
		if [ -f "${ADDON_REQUIREMENTS_FILE}" ] && [ -r "${ADDON_REQUIREMENTS_FILE}" ]; then
			echo "Appending addon requirements from ${ADDON_REQUIREMENTS_FILE} to requirements.txt..."
			echo "" >> requirements.txt
			cat "${ADDON_REQUIREMENTS_FILE}" >> requirements.txt
			if [[ $? -ne 0 ]]; then
				echo "Failed to append addon requirements."
				exit 1
			fi
			echo "Addon requirements appended successfully."
		else
			echo "Error: Addon requirements file ${ADDON_REQUIREMENTS_FILE} does not exist or is not readable."
			exit 1
		fi
	fi
	pip install --upgrade pip
	pip download ${PIP_PLATFORM} -r requirements.txt -d ./wheels --index-url ${PIP_MIRROR_URL} --trusted-host ${TRUSTED_HOST}
	if [[ $? -ne 0 ]]; then
		echo "Pip download failed."
		exit 1
	fi
	if [[ "linux" == "$OS_TYPE" ]]; then
		sed -i '1i\--no-index --find-links=./wheels/' requirements.txt
	elif [[ "darwin" == "$OS_TYPE" ]]; then
		sed -i ".bak" '1i\
--no-index --find-links=./wheels/
  ' requirements.txt
		rm -f requirements.txt.bak
	fi
	IGNORE_PATH=.difyignore
	if [ ! -f "$IGNORE_PATH" ]; then
		IGNORE_PATH=.gitignore
	fi
	if [ -f "$IGNORE_PATH" ]; then
		if [[ "linux" == "$OS_TYPE" ]]; then
			sed -i '/^wheels\//d' "${IGNORE_PATH}"
		elif [[ "darwin" == "$OS_TYPE" ]]; then
			sed -i ".bak" '/^wheels\//d' "${IGNORE_PATH}"
			rm -f "${IGNORE_PATH}.bak"
		fi
	fi
	cd ${CURR_DIR}
	chmod 755 ${CURR_DIR}/${CMD_NAME}
	mkdir -p ${OUTPUT_DIR}
	${CURR_DIR}/${CMD_NAME} plugin package ${FLATTEN_DIR} -o ${OUTPUT_DIR}/${PACKAGE_NAME}-${PACKAGE_SUFFIX}.difypkg --max-size 5120
	if [ $? -ne 0 ]; then
    echo "Repackage failed."
    exit 1
  fi
	echo "Repackage success."
}

install_unzip(){
	if ! command -v unzip &> /dev/null; then
		echo "Installing unzip ..."
		yum -y install unzip
		if [ $? -ne 0 ]; then
			echo "Install unzip failed."
			exit 1
		fi
	fi
}

clean() {
	# 定义目标文件夹
	FLATTENS_DIR=${CURR_DIR}/flattens
	PLUGINS_DIR=${CURR_DIR}/plugins
	OFFLINES_DIR=${CURR_DIR}/offlines
	
	# 检查是否提供了第二个参数
	if [[ -z "$2" ]]; then
		# 清空所有三个文件夹
		echo "Cleaning all directories: flattens, plugins, offlines"
		# 确认操作
		echo "Are you sure you want to clean all directories? (y/N)"
		read -r CONFIRM
		if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
			echo "Clean operation cancelled."
			exit 0
		fi
		
		# 清空 flattens 目录
		if [ -d "$FLATTENS_DIR" ]; then
			echo "Cleaning $FLATTENS_DIR..."
			rm -rf "$FLATTENS_DIR"/*
		else
			mkdir -p "$FLATTENS_DIR"
		fi
		
		# 清空 plugins 目录
		if [ -d "$PLUGINS_DIR" ]; then
			echo "Cleaning $PLUGINS_DIR..."
			rm -rf "$PLUGINS_DIR"/*
		else
			mkdir -p "$PLUGINS_DIR"
		fi
		
		# 清空 offlines 目录
		if [ -d "$OFFLINES_DIR" ]; then
			echo "Cleaning $OFFLINES_DIR..."
			rm -rf "$OFFLINES_DIR"/*
		else
			mkdir -p "$OFFLINES_DIR"
		fi
		
		echo "All directories cleaned successfully."
	else
		# 清空指定的单个文件夹
		TARGET_DIR="$2"
		case "$TARGET_DIR" in
			"flattens")
				if [ -d "$FLATTENS_DIR" ]; then
					echo "Cleaning $FLATTENS_DIR..."
					rm -rf "$FLATTENS_DIR"/*
				else
					mkdir -p "$FLATTENS_DIR"
				fi
				echo "flattens directory cleaned successfully."
				;;
			"plugins")
				if [ -d "$PLUGINS_DIR" ]; then
					echo "Cleaning $PLUGINS_DIR..."
					rm -rf "$PLUGINS_DIR"/*
				else
					mkdir -p "$PLUGINS_DIR"
				fi
				echo "plugins directory cleaned successfully."
				;;
			"offlines")
				if [ -d "$OFFLINES_DIR" ]; then
					echo "Cleaning $OFFLINES_DIR..."
					rm -rf "$OFFLINES_DIR"/*
				else
					mkdir -p "$OFFLINES_DIR"
				fi
				echo "offlines directory cleaned successfully."
				;;
			*)
				echo "Invalid directory name. Please use one of: flattens, plugins, offlines"
				exit 1
				;;
		esac
	fi
}

print_usage() {
	echo "usage: $0 [-p platform] [-s package_suffix] [-r addon-requirements.txt] {market|github|local|clean}"
	echo "-p platform: python packages' platform. Using for crossing repacking.
        For example: -p manylinux2014_x86_64 or -p manylinux2014_aarch64"
	echo "-s package_suffix: The suffix name of the output offline package.
        For example: -s linux-amd64 or -s linux-arm64"
	echo "-r addon-requirements.txt: Addon requirements file to append to main requirements.txt"
	echo "clean: Clean specified directories."
	echo "  Usage: $0 clean [directory]"
	echo "  Example: $0 clean (clean all directories)"
	echo "  Example: $0 clean flattens (clean only flattens directory)"
	exit 1
}

ADDON_REQUIREMENTS_FILE=""

while getopts "p:s:r:" opt;
do
	case "$opt" in
		p) PIP_PLATFORM="--platform ${OPTARG} --only-binary=:all:" ;;
		s) PACKAGE_SUFFIX="${OPTARG}" ;;
		r) ADDON_REQUIREMENTS_FILE="${OPTARG}" ;;
		*) print_usage; exit 1 ;;
	esac
done

shift $((OPTIND - 1))

echo "$1"
case "$1" in
	'market')
	market $@
	;;
	'github')
	github $@
	;;
	'local')
	_local $@
	;;
	'clean')
	clean $@
	;;
	*)

print_usage
exit 1
esac
exit 0
