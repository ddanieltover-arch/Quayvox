import { useState } from 'react';
import { FileText, Upload, Download, Trash2, Search, File, FileSpreadsheet, FileImage } from 'lucide-react';

const mockDocs = [
  { id: '1', name: 'BOL-7842.pdf', type: 'pdf', shipment: 'SH-2026-7842', size: '245 KB', uploaded: '2026-05-01' },
  { id: '2', name: 'Invoice-7842.pdf', type: 'pdf', shipment: 'SH-2026-7842', size: '128 KB', uploaded: '2026-05-01' },
  { id: '3', name: 'AWB-7844.pdf', type: 'pdf', shipment: 'SH-2026-7844', size: '89 KB', uploaded: '2026-05-25' },
  { id: '4', name: 'SDS-7844.pdf', type: 'pdf', shipment: 'SH-2026-7844', size: '312 KB', uploaded: '2026-05-25' },
  { id: '5', name: 'Phytosanitary-7848.pdf', type: 'pdf', shipment: 'SH-2026-7848', size: '156 KB', uploaded: '2026-05-22' },
  { id: '6', name: 'CMR-7845.pdf', type: 'pdf', shipment: 'SH-2026-7845', size: '98 KB', uploaded: '2026-05-20' },
  { id: '7', name: 'Invoice-7849.xlsx', type: 'spreadsheet', shipment: 'SH-2026-7849', size: '45 KB', uploaded: '2026-05-08' },
  { id: '8', name: 'Packing-List-7842.jpg', type: 'image', shipment: 'SH-2026-7842', size: '1.2 MB', uploaded: '2026-05-01' },
];

const Documents = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [docs, setDocs] = useState(mockDocs);

  const filtered = docs.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.shipment.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || d.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-400" />;
      case 'spreadsheet': return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case 'image': return <FileImage className="w-5 h-5 text-amber-400" />;
      default: return <File className="w-5 h-5 text-text-secondary" />;
    }
  };

  const handleUpload = () => {
    const newDoc = {
      id: String(docs.length + 1),
      name: `Uploaded-${Date.now()}.pdf`,
      type: 'pdf',
      shipment: 'SH-2026-7842',
      size: '156 KB',
      uploaded: new Date().toISOString().split('T')[0],
    };
    setDocs(prev => [newDoc, ...prev]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Documents</h1>
          <p className="text-sm text-text-secondary mt-1">{filtered.length} documents</p>
        </div>
        <button onClick={handleUpload} className="btn-primary flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-800 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-navy-800 border border-white/5 text-text-primary text-sm focus:outline-none focus:border-cobalt/50">
          <option value="All">All Types</option>
          <option value="pdf">PDF</option>
          <option value="spreadsheet">Spreadsheet</option>
          <option value="image">Image</option>
        </select>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-navy-800/50">
                <th className="py-3 px-4 text-left text-xs font-mono text-text-secondary">Document</th>
                <th className="py-3 px-4 text-left text-xs font-mono text-text-secondary">Shipment</th>
                <th className="py-3 px-4 text-left text-xs font-mono text-text-secondary">Type</th>
                <th className="py-3 px-4 text-left text-xs font-mono text-text-secondary">Size</th>
                <th className="py-3 px-4 text-left text-xs font-mono text-text-secondary">Uploaded</th>
                <th className="py-3 px-4 text-right text-xs font-mono text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {getIcon(doc.type)}
                      <span className="text-sm text-text-primary">{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-mono text-cobalt">{doc.shipment}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-text-secondary capitalize">{doc.type}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-text-secondary">{doc.size}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-text-secondary">{doc.uploaded}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-cobalt">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Documents;
