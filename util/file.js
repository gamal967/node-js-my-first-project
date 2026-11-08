const fs = require('fs');

const deleteFile = filePath => {
    fs.unlink(filePath, err => {
        // A missing file is harmless. Any other failure (for example a
        // read-only filesystem on Hostless) must not crash the process.
        if (err && err.code !== 'ENOENT') {
            console.warn('Could not delete file "' + filePath + '":', err.message);
        }
    });
};

exports.deleteFile = deleteFile;
