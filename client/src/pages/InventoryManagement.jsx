import React, { useEffect, useState } from 'react';
import { inventoryService } from '../services/api';
import {
  Layers,
  PlusCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Trash2
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = [
  'Packed Red Blood Cells (PRBC)',
  'Whole Blood',
  'Fresh Frozen Plasma (FFP)',
  'Platelets',
  'Cryoprecipitate'
];

const InventoryManagement = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Add Unit Form State
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [component, setComponent] = useState('Packed Red Blood Cells (PRBC)');
  const [volumeMl, setVolumeMl] = useState(450);
  const [fridgeUnit, setFridgeUnit] = useState('Fridge-A1');
  const [shelfNumber, setShelfNumber] = useState('Rack-1');

  // Test Results Form State
  const [hiv, setHiv] = useState(false);
  const [hepatitisB, setHepatitisB] = useState(false);
  const [hepatitisC, setHepatitisC] = useState(false);
  const [syphilis, setSyphilis] = useState(false);
  const [malaria, setMalaria] = useState(false);
  const [testingStatus, setTestingStatus] = useState('passed');

  const [message, setMessage] = useState('');

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getAllUnits({
        bloodGroup: filterGroup || undefined,
        status: filterStatus || undefined,
        search: searchTerm || undefined
      });
      if (res.data.success) {
        setUnits(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [filterGroup, filterStatus]);

  const handleAddUnit = async (e) => {
    e.preventDefault();
    try {
      const res = await inventoryService.addUnit({
        bloodGroup,
        component,
        volumeMl: Number(volumeMl),
        storageLocation: {
          refrigeratorUnit: fridgeUnit,
          shelfNumber
        }
      });
      if (res.data.success) {
        setMessage('Blood unit registered into laboratory quarantine');
        setShowAddModal(false);
        fetchUnits();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleOpenTestModal = (unit) => {
    setSelectedUnit(unit);
    setHiv(unit.serologyTestResults?.hiv || false);
    setHepatitisB(unit.serologyTestResults?.hepatitisB || false);
    setHepatitisC(unit.serologyTestResults?.hepatitisC || false);
    setSyphilis(unit.serologyTestResults?.syphilis || false);
    setMalaria(unit.serologyTestResults?.malaria || false);
    setTestingStatus(unit.testingStatus === 'pending' ? 'passed' : unit.testingStatus);
    setShowTestModal(true);
  };

  const handleSaveTestResults = async (e) => {
    e.preventDefault();
    if (!selectedUnit) return;
    try {
      // If any infection is true, status must be failed
      const hasInfection = hiv || hepatitisB || hepatitisC || syphilis || malaria;
      const finalStatus = hasInfection ? 'failed' : testingStatus;

      const res = await inventoryService.updateTesting(selectedUnit._id, {
        testingStatus: finalStatus,
        serologyTestResults: {
          hiv,
          hepatitisB,
          hepatitisC,
          syphilis,
          malaria
        }
      });
      if (res.data.success) {
        setMessage(`Unit ${selectedUnit.bagBarcode} test updated: ${finalStatus.toUpperCase()}`);
        setShowTestModal(false);
        fetchUnits();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handlePurgeExpired = async () => {
    try {
      const res = await inventoryService.purgeExpired();
      if (res.data.success) {
        setMessage(res.data.message);
        fetchUnits();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-red-600 tracking-wider">
            Cold Vault Management
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            Blood Units & Laboratory Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Track individual barcodes, cold-storage locations, and infectious disease testing status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePurgeExpired}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5"
            title="Scan dates and flag expired units"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            Check Expirations
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Stock In Unit
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Blood Group Filter */}
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700"
          >
            <option value="">All Blood Types</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="available">Available (Tested)</option>
            <option value="quarantine">Quarantine (Pending Lab)</option>
            <option value="reserved">Reserved (Order Placed)</option>
            <option value="dispatched">Dispatched</option>
            <option value="expired">Expired</option>
            <option value="discarded">Discarded (Failed Test)</option>
          </select>

          <button
            onClick={() => { setFilterGroup(''); setFilterStatus(''); setSearchTerm(''); }}
            className="text-xs text-slate-500 hover:text-red-600 underline"
          >
            Reset Filters
          </button>
        </div>

        {/* Barcode Search */}
        <form onSubmit={(e) => { e.preventDefault(); fetchUnits(); }} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search Barcode (e.g. BAG-OM-001)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Search
          </button>
        </form>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Bag Barcode</th>
                <th className="py-3 px-4">Type & Component</th>
                <th className="py-3 px-4">Storage Location</th>
                <th className="py-3 px-4">Collected</th>
                <th className="py-3 px-4">Expires In</th>
                <th className="py-3 px-4">Lab Serology</th>
                <th className="py-3 px-4">Vault Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {units.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 text-xs">
                    No blood units found matching your criteria.
                  </td>
                </tr>
              ) : (
                units.map((unit) => {
                  const daysToExpiry = Math.ceil(
                    (new Date(unit.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <tr key={unit._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {unit.bagBarcode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-red-600">{unit.bloodGroup}</span>
                          <span className="text-xs text-slate-600">({unit.volumeMl}ml)</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{unit.component}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                        {unit.storageLocation?.refrigeratorUnit || 'Vault-1'} / {unit.storageLocation?.shelfNumber || 'Shelf-1'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(unit.collectionDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-bold ${
                            daysToExpiry <= 3
                              ? 'text-red-600 font-extrabold'
                              : daysToExpiry <= 7
                              ? 'text-amber-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {daysToExpiry > 0 ? `${daysToExpiry} days` : 'EXPIRED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            unit.testingStatus === 'passed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : unit.testingStatus === 'failed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {unit.testingStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            unit.status === 'available'
                              ? 'bg-emerald-100 text-emerald-700'
                              : unit.status === 'quarantine'
                              ? 'bg-amber-100 text-amber-700'
                              : unit.status === 'reserved'
                              ? 'bg-blue-100 text-blue-700'
                              : unit.status === 'expired'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {unit.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenTestModal(unit)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                        >
                          Update Testing
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock In Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Stock In New Blood Unit</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddUnit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Volume (ml)
                  </label>
                  <input
                    type="number"
                    value={volumeMl}
                    onChange={(e) => setVolumeMl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Component Type
                </label>
                <select
                  value={component}
                  onChange={(e) => setComponent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  {COMPONENTS.map((comp) => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Refrigerator Unit
                  </label>
                  <input
                    type="text"
                    value={fridgeUnit}
                    onChange={(e) => setFridgeUnit(e.target.value)}
                    placeholder="Fridge-A1"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Shelf / Rack
                  </label>
                  <input
                    type="text"
                    value={shelfNumber}
                    onChange={(e) => setShelfNumber(e.target.value)}
                    placeholder="Rack-2"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500 italic">
                * Note: New blood units automatically enter 'quarantine' status until lab serology tests are documented and verified.
              </p>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-500/20"
                >
                  Register Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Serology Testing Modal */}
      {showTestModal && selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Serology & Viral Screening</h3>
                <span className="text-xs font-mono font-bold text-red-600">
                  Barcode: {selectedUnit.bagBarcode} ({selectedUnit.bloodGroup})
                </span>
              </div>
              <button onClick={() => setShowTestModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveTestResults} className="space-y-4">
              <p className="text-xs text-slate-600">
                Check box only if test result is <strong>REACTIVE (Positive / Contaminated)</strong>:
              </p>

              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input type="checkbox" checked={hiv} onChange={(e) => setHiv(e.target.checked)} className="w-4 h-4 text-red-600 rounded" />
                  <span className={hiv ? 'font-bold text-red-600' : 'text-slate-700'}>HIV 1/2 Antibodies / NAT Reactive</span>
                </label>

                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input type="checkbox" checked={hepatitisB} onChange={(e) => setHepatitisB(e.target.checked)} className="w-4 h-4 text-red-600 rounded" />
                  <span className={hepatitisB ? 'font-bold text-red-600' : 'text-slate-700'}>Hepatitis B Surface Antigen (HBsAg) Reactive</span>
                </label>

                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input type="checkbox" checked={hepatitisC} onChange={(e) => setHepatitisC(e.target.checked)} className="w-4 h-4 text-red-600 rounded" />
                  <span className={hepatitisC ? 'font-bold text-red-600' : 'text-slate-700'}>Hepatitis C Virus (HCV) Reactive</span>
                </label>

                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input type="checkbox" checked={syphilis} onChange={(e) => setSyphilis(e.target.checked)} className="w-4 h-4 text-red-600 rounded" />
                  <span className={syphilis ? 'font-bold text-red-600' : 'text-slate-700'}>Syphilis (VDRL / RPR) Reactive</span>
                </label>

                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input type="checkbox" checked={malaria} onChange={(e) => setMalaria(e.target.checked)} className="w-4 h-4 text-red-600 rounded" />
                  <span className={malaria ? 'font-bold text-red-600' : 'text-slate-700'}>Malaria Parasite Screen Reactive</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Overall Lab Decision
                </label>
                <select
                  value={testingStatus}
                  onChange={(e) => setTestingStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                >
                  <option value="passed">PASSED (All Non-Reactive ➔ Release to Available Stock)</option>
                  <option value="failed">FAILED (Reactive ➔ Mark Discarded)</option>
                  <option value="pending">PENDING (Keep in Quarantine)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-500/20"
                >
                  Save & Apply Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
