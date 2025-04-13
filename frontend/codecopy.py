import os
import re

def is_code_file(filename):
    """Check if a file is likely a code file based on its extension."""
    code_extensions = [
        '.py', '.js', '.html', '.css', '.java', '.c', '.cpp', '.h', '.cs',
        '.go', '.rb', '.php', '.swift', '.kt', '.ts', '.jsx', '.tsx',
        '.vue', '.sh', '.bat', '.ps1', '.sql', '.r', '.m', '.scala',
        '.dart', '.rs', '.ex', '.exs', '.erl', '.lua', '.pl', '.pm',
        '.groovy', '.tf', '.yml', '.yaml', '.json', '.xml', '.md'
    ]
    
    _, ext = os.path.splitext(filename)
    return ext.lower() in code_extensions

def collect_code_files(root_dir, output_file):
    """Traverse directories and write code file contents to output file."""
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for dirpath, dirnames, filenames in os.walk(root_dir):
            # Skip .git, node_modules, __pycache__, etc.
            dirnames[:] = [d for d in dirnames if not d.startswith('.') and d != 'node_modules' and d != '__pycache__']
            
            for filename in filenames:
                if is_code_file(filename):
                    file_path = os.path.join(dirpath, filename)
                    rel_path = os.path.relpath(file_path, root_dir)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            
                            # Write file path as a header
                            outfile.write(f"{rel_path}\n")
                            outfile.write("="*len(rel_path) + "\n\n")
                            
                            # Write file content
                            outfile.write(content)
                            
                            # Add separator between files
                            outfile.write("\n\n")
                            outfile.write("="*50 + "\n\n")
                    except UnicodeDecodeError:
                        outfile.write(f"{rel_path} - Could not read (binary file)\n\n")
                        outfile.write("="*50 + "\n\n")
                    except Exception as e:
                        outfile.write(f"{rel_path} - Error reading file: {str(e)}\n\n")
                        outfile.write("="*50 + "\n\n")

if __name__ == "__main__":
    # Define the root directory (current directory) and output file
    root_directory = "."
    output_filename = "all_code_files.txt"
    
    collect_code_files(root_directory, output_filename)
    print(f"All code files have been collected in {output_filename}")