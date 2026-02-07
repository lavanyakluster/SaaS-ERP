'use client';

import { useState } from 'react';
import { Search, Eye, Edit, Trash2, Plus, Building2, FileText, ChevronDown, Loader2 } from 'lucide-react';
import { MODULE_PERMISSIONS } from '@/config/permissions';
import { useBranches } from '@/lib/hooks';
import { VirtualBranchList } from './VirtualBranchList';

type CrudPermission = {
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
};

interface PermissionsPanelProps {
  modulePermissions: Record<string, CrudPermission>;
  selectedBranches: string[];
  onModulePermissionToggle: (moduleId: string, permission: keyof CrudPermission) => void;
  onModuleSelectAll: (moduleId: string) => void;
  onSelectAllModules: () => void;
  onBranchToggle: (branchId: string) => void;
  onSelectAllBranches: (filteredBranchIds: string[]) => void;
  isDark: boolean;
}

export function PermissionsPanel({
  modulePermissions,
  selectedBranches,
  onModulePermissionToggle,
  onModuleSelectAll,
  onSelectAllModules,
  onBranchToggle,
  onSelectAllBranches,
  isDark,
}: PermissionsPanelProps) {
  const [branchSearch, setBranchSearch] = useState('');
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // ✅ Fetch real branches from API
  const { data: branchesData, isLoading: branchesLoading } = useBranches();
  
  // ✅ Map API response to expected format
  const branches = (branchesData || []).map(branch => ({
    id: branch.bR_COD, // Use branch code as ID
    name: branch.bR_NM, // Use branch name
    businessUnit: branch.bR_BUNIT, // Include business unit
  }));

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(branchSearch.toLowerCase()) ||
    branch.id.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const handleSelectAllBranches = () => {
    onSelectAllBranches(filteredBranches.map(b => b.id));
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  // Get only main menus for rendering
  const mainMenus = MODULE_PERMISSIONS.filter(m => m.isMainMenu);

  // Check if all modules have all permissions selected
  const allModulesFullySelected = mainMenus.every(menu => {
    const perms = modulePermissions[menu.id];
    return perms?.add && perms?.view && perms?.edit && perms?.delete;
  });

  return (
    <>
      {/* Middle Column - Module Permissions (5 columns on desktop, full width on mobile) */}
      <div className="lg:col-span-5 h-[600px] sm:h-[650px]">
        <div className={`rounded-lg sm:rounded-xl border h-full flex flex-col ${
          isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
        }`}>
          <div className={`px-3 sm:px-4 py-2.5 sm:py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                Module Permissions
              </h3>
              <input
                type="checkbox"
                checked={allModulesFullySelected}
                onChange={onSelectAllModules}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                title="Select All Modules"
              />
            </div>
          </div>

          {/* Table Header */}
          <div className={`grid grid-cols-[1.5fr_repeat(4,1fr)_40px] sm:grid-cols-[2fr_repeat(4,1fr)_40px] gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wide border-b ${
            isDark 
              ? 'bg-gray-700/50 text-gray-300 border-gray-700' 
              : 'bg-gray-100 text-gray-700 border-gray-200'
          }`}>
            <div className="truncate">Module</div>
            <div className="text-center flex items-center justify-center gap-0.5 sm:gap-1">
              <Plus className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 hidden sm:block" />
              <span className="hidden sm:inline">Add</span>
              <span className="sm:hidden">+</span>
            </div>
            <div className="text-center flex items-center justify-center gap-0.5 sm:gap-1">
              <Eye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 hidden sm:block" />
              <span className="hidden sm:inline">View</span>
              <span className="sm:hidden">👁</span>
            </div>
            <div className="text-center flex items-center justify-center gap-0.5 sm:gap-1">
              <Edit className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 hidden sm:block" />
              <span className="hidden sm:inline">Edit</span>
              <span className="sm:hidden">✏</span>
            </div>
            <div className="text-center flex items-center justify-center gap-0.5 sm:gap-1">
              <Trash2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 hidden sm:block" />
              <span className="hidden sm:inline">Delete</span>
              <span className="sm:hidden">🗑</span>
            </div>
            <div className="text-center text-[9px] sm:text-xs">All</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {mainMenus.map((mainMenu) => {
              const mainPerms = modulePermissions[mainMenu.id];
              const mainAllChecked = mainPerms?.add && mainPerms?.view && mainPerms?.edit && mainPerms?.delete;
              const isExpanded = expandedMenus.includes(mainMenu.id);
              const hasSubmenus = mainMenu.submenus && mainMenu.submenus.length > 0;

              return (
                <div key={mainMenu.id}>
                  {/* Main Menu Row */}
                  <div
                    className={`grid grid-cols-[1.5fr_repeat(4,1fr)_40px] sm:grid-cols-[2fr_repeat(4,1fr)_40px] gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 border-b transition-all ${
                      isDark
                        ? 'border-gray-700/50 hover:bg-gray-700/30 bg-gray-700/20'
                        : 'border-gray-200/50 hover:bg-gray-50 bg-gray-100/50'
                    } ${mainAllChecked ? (isDark ? 'bg-emerald-900/10' : 'bg-emerald-50/50') : ''}`}
                  >
                    <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                      {/* Expand/Collapse Button */}
                      {hasSubmenus && (
                        <button
                          onClick={() => toggleMenu(mainMenu.id)}
                          className={`p-0.5 sm:p-1 rounded-md sm:rounded-lg transition-all flex-shrink-0 ${
                            isDark
                              ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200'
                              : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <ChevronDown
                            className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      )}
                      {!hasSubmenus && <div className="w-4 sm:w-6 flex-shrink-0"></div>}
                      
                      {/* Icon */}
                      {mainMenu.icon && (
                        <mainMenu.icon className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                      )}
                      
                      {/* Label */}
                      <span className={`text-xs sm:text-sm font-bold truncate ${
                        isDark ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {mainMenu.label}
                      </span>
                    </div>

                    {/* Add */}
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={mainPerms?.add || false}
                        onChange={() => onModulePermissionToggle(mainMenu.id, 'add')}
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>

                    {/* View */}
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={mainPerms?.view || false}
                        onChange={() => onModulePermissionToggle(mainMenu.id, 'view')}
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Edit */}
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={mainPerms?.edit || false}
                        onChange={() => onModulePermissionToggle(mainMenu.id, 'edit')}
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Delete */}
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={mainPerms?.delete || false}
                        onChange={() => onModulePermissionToggle(mainMenu.id, 'delete')}
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                    </div>

                    {/* Select All */}
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={mainAllChecked}
                        onChange={() => onModuleSelectAll(mainMenu.id)}
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Submenus (Collapsible) */}
                  {hasSubmenus && isExpanded && mainMenu.submenus?.map((submenu) => {
                    const subPerms = modulePermissions[submenu.id];
                    const subAllChecked = subPerms?.add && subPerms?.view && subPerms?.edit && subPerms?.delete;

                    return (
                      <div
                        key={submenu.id}
                        className={`grid grid-cols-[1.5fr_repeat(4,1fr)_40px] sm:grid-cols-[2fr_repeat(4,1fr)_40px] gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 border-b transition-all ${
                          isDark
                            ? 'border-gray-700/50 hover:bg-gray-700/30'
                            : 'border-gray-200/50 hover:bg-gray-50'
                        } ${subAllChecked ? (isDark ? 'bg-emerald-900/10' : 'bg-emerald-50/50') : ''}`}
                      >
                        <div className="flex items-center gap-1 sm:gap-2 pl-6 sm:pl-10 min-w-0">
                          {/* Tree Line */}
                          <span className={`text-[10px] sm:text-xs flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            └─
                          </span>
                          
                          {/* Label */}
                          <span className={`text-xs sm:text-sm font-medium truncate ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {submenu.label}
                          </span>
                        </div>

                        {/* Add */}
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={subPerms?.add || false}
                            onChange={() => onModulePermissionToggle(submenu.id, 'add')}
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </div>

                        {/* View */}
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={subPerms?.view || false}
                            onChange={() => onModulePermissionToggle(submenu.id, 'view')}
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>

                        {/* Edit */}
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={subPerms?.edit || false}
                            onChange={() => onModulePermissionToggle(submenu.id, 'edit')}
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                        </div>

                        {/* Delete */}
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={subPerms?.delete || false}
                            onChange={() => onModulePermissionToggle(submenu.id, 'delete')}
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                          />
                        </div>

                        {/* Select All */}
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={subAllChecked}
                            onChange={() => onModuleSelectAll(submenu.id)}
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Columns - Branch & Ledger Access (4 columns total on desktop, full width on mobile) */}
      <div className="lg:col-span-4 grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6 h-[600px] sm:h-[650px]">
        {/* Branch Access */}
        <div className={`rounded-lg sm:rounded-xl border overflow-hidden flex flex-col h-full ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`px-3 sm:px-4 py-2.5 sm:py-3 border-b ${
            isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                Branch Access
              </h3>
              <input
                type="checkbox"
                checked={filteredBranches.length > 0 && filteredBranches.every(b => selectedBranches.includes(b.id))}
                onChange={handleSelectAllBranches}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                title="Select All"
              />
            </div>
            <div className="relative">
              <Search className={`absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
                placeholder="Search branches..."
                className={`w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border ${
                  isDark
                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <p className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedBranches.length} of {branches.length} selected
            </p>
          </div>

          <div className="flex-1 overflow-hidden">
            {branchesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 animate-spin" />
              </div>
            ) : (
              <VirtualBranchList
                branches={filteredBranches}
                selectedBranches={selectedBranches}
                onBranchToggle={onBranchToggle}
                isDark={isDark}
              />
            )}
          </div>
        </div>

        {/* Ledger Access removed */}
      </div>
    </>
  );
}
