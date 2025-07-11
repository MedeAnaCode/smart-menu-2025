import os
from pathlib import Path

# Global configurations for white and black lists
WHITE_LIST_EXTENSIONS = ['.py', '.md', '.txt', '.yml', '.yaml']
FILES_WITH_NO_EXTENSIONS = ['Dockerfile', 'README']
BLACK_LIST_PATTERNS = ['.', '_', 'proj_traverser', 'output.md']
BLACK_LIST_FILE_NAMES = ['.', '_', 'proj_traverser', 'output.md']

def build_tree(startpath, prefix=''):
    """Recursively build the directory tree string starting from startpath."""
    tree_lines = []
    try:
        # List all entries in the directory
        entries = sorted(os.listdir(startpath))
        # Filter entries based on black list patterns
        entries = [entry for entry in entries if not any(entry.startswith(pattern) for pattern in BLACK_LIST_PATTERNS)]
        # Determine the number of entries
        count = len(entries)
        for index, entry in enumerate(entries):
            # Create full path to the item
            path = os.path.join(startpath, entry)
            # Check if it's a directory
            is_last = index == count - 1
            # Determine the tree prefix to use
            connector = '└── ' if is_last else '├── '
            tree_prefix = prefix + connector
            # Accumulate the current entry
            tree_lines.append(tree_prefix + entry)
            # If it's a directory, recursively build its contents
            if os.path.isdir(path):
                # Update prefix for subdirectories
                sub_prefix = prefix + ('    ' if is_last else '│   ')
                tree_lines.append(build_tree(path, sub_prefix))
    except PermissionError:
        # Skip directories we don't have permission to access
        tree_lines.append(prefix + "├── [Permission Denied]")
    except FileNotFoundError:
        # Handle the case where the directory might be missing
        tree_lines.append(prefix + "├── [Not Found]")
    return '\n'.join(tree_lines)

def read_file_content(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
        content = content.replace('\n```', '\n\\```')
    return content

def generate_markdown(root_dir):
    markdown_content = '# Project structure\n'
    markdown_content += '```\n' + build_tree(root_dir) + '\n```\n\n'
    markdown_content += '# Files\n'
    for root, dirs, files in os.walk(root_dir):
        # Filter directories based on black list patterns
        dirs[:] = [d for d in dirs if not any(d.startswith(pattern) for pattern in BLACK_LIST_PATTERNS)]
        for f in files:
            # Filter files based on black list file names
            if not any(f.startswith(pattern) for pattern in BLACK_LIST_FILE_NAMES):
                if any(f.endswith(ext) for ext in WHITE_LIST_EXTENSIONS) or f in FILES_WITH_NO_EXTENSIONS:  # review it
                    file_path = Path(root) / f
                    relative_path = file_path.relative_to(root_dir).as_posix()
                    markdown_content += f'## ./{relative_path}\n'
                    markdown_content += '```\n' + read_file_content(file_path) + '\n```\n'
    return markdown_content

def main():
    script_dir = Path(__file__).resolve().parent
    markdown_content = generate_markdown(script_dir)
    output_path = script_dir / 'output.md'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(markdown_content)

if __name__ == '__main__':
    main()