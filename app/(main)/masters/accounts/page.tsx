'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/store/theme-store';
import { useGradientStore } from '@/lib/store/gradient-store';
import {
  MasterLayout,
  MasterPageHeader,
  MasterFormCard,
  MasterFormInput,
  MasterFormSelect,
  MasterFormAutocomplete,
} from '@/components/masters';
import { Users, FileText, Save, Trash2, RotateCcw } from 'lucide-react';
import { useAccountSearch, useAccountDetails, useGroupDetails, useCreateAccountMaster } from '@/lib/hooks/useAccountMaster';
import type { CreateAccountMasterRequest } from '@/lib/api/account-master.api';
import { toast } from 'sonner';

export default function AccountMasterPage() {
  const { theme, isDark } = useTheme();
  const themeMode = theme === 'system' ? (isDark ? 'dark' : 'light') : theme;
  const { activeGradient } = useGradientStore();

  const [searchText, setSearchText] = useState('');
  const [selectedAccountCode, setSelectedAccountCode] = useState('');
  const [groupCodeInput, setGroupCodeInput] = useState('');

  // Search accounts API call
  const { data: searchResults = [], isLoading: isSearching } = useAccountSearch(
    searchText,
    searchText.length > 0
  );

  // Get account details
  const { data: accountDetails, isLoading: isLoadingDetails } = useAccountDetails(
    selectedAccountCode,
    selectedAccountCode.length > 0
  );

  // Get group details using aC_GC
  const { data: groupDetails, isLoading: isLoadingGroup } = useGroupDetails(
    groupCodeInput,
    groupCodeInput.length > 0
  );

  // Create/Update account mutation
  const { mutate: saveAccount, isPending: isSaving } = useCreateAccountMaster();

  const [formData, setFormData] = useState({
    accountCode: '',
    name: '',
    place: '',
    selectType: '',
    address: '',
    addressLine1: '',
    addressLine2: '',
    bank: '',
    branch: '',
    phone: '',
    groupCode: '',
    groupName: '',
    seqNo: '',
    rep: '',
    state: '',
    regNo: '',  // This will be used for adRc
    dealerType: '',
    interState: '',
    discount: '',
    creditDays: '',
    creditLimit: '',
    email: '',
  });

  // Load account details
  useEffect(() => {
    if (accountDetails) {
      const loadedGroupCode = accountDetails.aC_GC || '';
      setFormData({
        accountCode: accountDetails.aC_COD || '',
        name: accountDetails.aC_NM || '',
        place: accountDetails.aC_PL || '',
        selectType: accountDetails.aC_TYP || '',
        address: accountDetails.aD_AD1 || '',
        addressLine1: accountDetails.aD_AD2 || '',
        addressLine2: accountDetails.aD_AD3 || '',
        bank: accountDetails.aD_BANK || '',
        branch: accountDetails.aD_BRANCH || '',
        phone: accountDetails.aD_PH || '',
        groupCode: loadedGroupCode,
        groupName: '',
        seqNo: accountDetails.aC_SEQ?.toString() || '',
        rep: '',
        state: accountDetails.aD_STATE || '',
        regNo: '',
        dealerType: '',
        interState: '',
        discount: '',
        creditDays: accountDetails.aD_CRP?.toString() || '',
        creditLimit: accountDetails.aD_CRLIMIT?.toString() || '',
        email: accountDetails.aD_MAIL || '',
      });
      setSearchText(accountDetails.aC_COD || '');
      setGroupCodeInput(loadedGroupCode);
    }
  }, [accountDetails]);

  // Load group name from API
  useEffect(() => {
    if (groupDetails) {
      setFormData(prev => ({
        ...prev,
        groupName: groupDetails.gR_NM || '',
      }));
    }
  }, [groupDetails]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'groupCode') {
      setGroupCodeInput(value);
    }
  };

  const handleAccountCodeChange = (value: string, option?: any) => {
    setSearchText(value);
    setFormData(prev => ({ ...prev, accountCode: value }));
    
    if (option && option.value) {
      setSelectedAccountCode(option.value);
    } else {
      setSelectedAccountCode('');
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleSave = () => {
    console.log('=== handleSave CALLED ===');
    console.log('Form Data:', formData);
    
    // Validate required fields
    if (!formData.accountCode) {
      console.error('Validation failed: Account Code is required');
      toast.error('Account Code is required');
      return;
    }
    if (!formData.name) {
      console.error('Validation failed: Account Name is required');
      toast.error('Account Name is required');
      return;
    }
    if (!formData.branch) {
      console.error('Validation failed: Branch is required');
      toast.error('Branch is required');
      return;
    }
    if (!formData.groupCode) {
      console.error('Validation failed: Group Code is required');
      toast.error('Group Code is required');
      return;
    }

    // Build API request with correct field names
    const accountData: Omit<CreateAccountMasterRequest, 'year'> = {
      acCode: formData.accountCode,
      acNm: formData.name,
      acPl: formData.place,
      acTyp: formData.selectType,
      adAd1: formData.address,
      adAd2: formData.addressLine1,
      adAd3: formData.addressLine2,
      adBank: formData.bank,
      adBranch: formData.branch,
      adPh: formData.phone,
      acGc: formData.groupCode,
      acSeq: parseInt(formData.seqNo, 10) || 0,
      adState: formData.state,
      adStno: formData.regNo || '',
      adDeatyp: formData.dealerType === 'registered' ? 1 : formData.dealerType === 'unregistered' ? 2 : formData.dealerType === 'compo' ? 3 : 0,
      adDis: parseFloat(formData.discount) || 0,
      adCrp: parseInt(formData.creditDays, 10) || 0,
      adcrLimit: parseFloat(formData.creditLimit) || 0,
      adMail: formData.email,
      editData: selectedAccountCode ? 1 : 0, // 1 for update, 0 for create
      adRc: formData.regNo || '',    // Empty string if not provided
      acUntyp: 'h',                  // Hardcoded
      adCstno: 'h',                  // Hardcoded
      acMaingc: 'j',                 // Hardcoded
    };

    console.log('=== CALLING API ===');
    console.log('Account Data:', JSON.stringify(accountData, null, 2));
    console.log('Is Saving:', isSaving);
    console.log('🕐 Timestamp:', new Date().toISOString());
    console.log('🌐 Network Tab: Look for POST http://130.94.45.215/V1/api/acmas');
    console.log('💡 TIP: Enable "Preserve log" in Network tab to see this request!');
    
    saveAccount(accountData, {
      onSuccess: (response) => {
        console.log('✅ API Success:', response);
        // Use the message from API response if available
        const successMessage = response?.message || 'Account saved successfully!';
        toast.success(successMessage, {
          duration: 4000,
          position: 'top-right',
        });
      },
      onError: (error: any) => {
        console.error('❌ API Error:', error);
        // Try to extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                            error?.message || 
                            'Failed to save account. Please try again.';
        toast.error(errorMessage, {
          duration: 5000,
          position: 'top-right',
        });
      }
    });
  };

  const handleClear = () => {
    setFormData({
      accountCode: '',
      name: '',
      place: '',
      selectType: '',
      address: '',
      addressLine1: '',
      addressLine2: '',
      bank: '',
      branch: '',
      phone: '',
      groupCode: '',
      groupName: '',
      seqNo: '',
      rep: '',
      state: '',
      regNo: '',
      dealerType: '',
      interState: '',
      discount: '',
      creditDays: '',
      creditLimit: '',
      email: '',
    });
    setSearchText('');
    setSelectedAccountCode('');
    setGroupCodeInput('');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this account?')) {
      handleClear();
      alert('Account deleted successfully!');
    }
  };

  const accountTypeOptions = [
    { value: 'balance_sheet', label: 'Balance Sheet' },
    { value: 'trading_account', label: 'Trading Account' },
    { value: 'pl_account', label: 'P&L Account' },
    { value: 'trading_balance_sheet', label: 'Trading & Balance Sheet' },
    { value: 'pl_balance_sheet', label: 'P&L Balance Sheet' },
  ];

  const stateOptions = [
    { value: '01', label: '01' },
    { value: '02', label: '02' },
    { value: '03', label: '03' },
    { value: '04', label: '04' },
    { value: '05', label: '05' },
    { value: '06', label: '06' },
    { value: '07', label: '07' },
    { value: '08', label: '08' },
    { value: '09', label: '09' },
    { value: '10', label: '10' },
    { value: '11', label: '11' },
    { value: '12', label: '12' },
    { value: '13', label: '13' },
    { value: '14', label: '14' },
    { value: '15', label: '15' },
    { value: '16', label: '16' },
    { value: '17', label: '17' },
    { value: '18', label: '18' },
    { value: '19', label: '19' },
    { value: '20', label: '20' },
    { value: '21', label: '21' },
    { value: '22', label: '22' },
    { value: '23', label: '23' },
    { value: '24', label: '24' },
    { value: '25', label: '25' },
    { value: '26', label: '26' },
    { value: '27', label: '27' },
    { value: '28', label: '28' },
  ];

  const dealerTypeOptions = [
    { value: 'registered', label: 'Registered' },
    { value: 'unregistered', label: 'UnRegistered' },
    { value: 'compo', label: 'Compo' },
  ];

  const interStateOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];

  return (
    <MasterLayout title="Account Master">
      {/* Header */}
      <MasterPageHeader
        title="Account Master"
        subtitle="Manage customer, supplier, and account information"
        icon={Users}
        gradient={activeGradient}
        theme={themeMode}
        onSave={handleSave}
        onDelete={handleDelete}
        onClear={handleClear}
        onDocument={() => alert('Document feature coming soon')}
        showDelete={true}
        showDocument={true}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <MasterFormCard theme={themeMode}>
            <div className="p-8">
              {/* Two Column Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {/* LEFT COLUMN */}
                <div className="space-y-6">
                  {/* Account Code - Autocomplete */}
                  <MasterFormAutocomplete
                    value={formData.accountCode}
                    onChange={handleAccountCodeChange}
                    onSearch={handleSearch}
                    options={searchResults.map(result => ({
                      value: result.aC_CODE,
                      label: result.aC_NAME,
                      id: result.aC_ID,
                    }))}
                    placeholder="Account Code"
                    label="Account Code"
                    theme={themeMode}
                    isLoading={isSearching}
                  />

                  {/* Name */}
                  <MasterFormInput
                    value={formData.name}
                    onChange={(value) => handleInputChange('name', value)}
                    placeholder="Name"
                    label="Name"
                    theme={themeMode}
                  />

                  {/* Place */}
                  <MasterFormInput
                    value={formData.place}
                    onChange={(value) => handleInputChange('place', value)}
                    placeholder="Place"
                    label="Place"
                    theme={themeMode}
                  />

                  {/* Select Type */}
                  <MasterFormSelect
                    value={formData.selectType}
                    onChange={(value) => handleInputChange('selectType', value)}
                    options={accountTypeOptions}
                    placeholder="Select Type"
                    label="Select Type"
                    theme={themeMode}
                  />

                  {/* Address */}
                  <MasterFormInput
                    value={formData.address}
                    onChange={(value) => handleInputChange('address', value)}
                    placeholder="Address"
                    label="Address"
                    theme={themeMode}
                  />

                  {/* Address Line 1 */}
                  <MasterFormInput
                    value={formData.addressLine1}
                    onChange={(value) => handleInputChange('addressLine1', value)}
                    placeholder="Address Line 1"
                    label="Address Line 1"
                    theme={themeMode}
                  />

                  {/* Address Line 2 */}
                  <MasterFormInput
                    value={formData.addressLine2}
                    onChange={(value) => handleInputChange('addressLine2', value)}
                    placeholder="Address Line 2"
                    label="Address Line 2"
                    theme={themeMode}
                  />

                  {/* Bank */}
                  <MasterFormInput
                    value={formData.bank}
                    onChange={(value) => handleInputChange('bank', value)}
                    placeholder="Bank"
                    label="Bank"
                    theme={themeMode}
                  />

                  {/* Branch & Phone - Side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <MasterFormInput
                      value={formData.branch}
                      onChange={(value) => handleInputChange('branch', value)}
                      placeholder="Branch"
                      label="Branch"
                      theme={themeMode}
                    />

                    <MasterFormInput
                      value={formData.phone}
                      onChange={(value) => handleInputChange('phone', value)}
                      placeholder="Phone"
                      label="Phone"
                      type="tel"
                      theme={themeMode}
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                  {/* Group Code */}
                  <MasterFormInput
                    value={formData.groupCode}
                    onChange={(value) => handleInputChange('groupCode', value)}
                    placeholder="Group Code"
                    label="Group Code"
                    theme={themeMode}
                  />

                  {/* Group Name - Auto-populated from API */}
                  <div className="relative">
                    <MasterFormInput
                      value={formData.groupName}
                      onChange={(value) => handleInputChange('groupName', value)}
                      placeholder={isLoadingGroup ? "Loading..." : "Group Name"}
                      label="Group Name"
                      theme={themeMode}
                      disabled={isLoadingGroup}
                    />
                    {isLoadingGroup && (
                      <div className="absolute right-3 top-9">
                        <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Seq No & Rep - Side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <MasterFormInput
                      value={formData.seqNo}
                      onChange={(value) => handleInputChange('seqNo', value)}
                      placeholder="Seq No"
                      label="Seq No"
                      type="number"
                      theme={themeMode}
                    />

                    <MasterFormInput
                      value={formData.rep}
                      onChange={(value) => handleInputChange('rep', value)}
                      placeholder="Rep"
                      label="Rep"
                      theme={themeMode}
                    />
                  </div>

                  {/* State */}
                  <MasterFormSelect
                    value={formData.state}
                    onChange={(value) => handleInputChange('state', value)}
                    options={stateOptions}
                    placeholder="State"
                    label="State"
                    theme={themeMode}
                  />

                  {/* Reg No */}
                  <MasterFormInput
                    value={formData.regNo}
                    onChange={(value) => handleInputChange('regNo', value)}
                    placeholder="Reg No"
                    label="Reg No"
                    theme={themeMode}
                  />

                  {/* Dealer Type & Inter State - Side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <MasterFormSelect
                      value={formData.dealerType}
                      onChange={(value) => handleInputChange('dealerType', value)}
                      options={dealerTypeOptions}
                      placeholder="Dealer Type"
                      label="Dealer Type"
                      theme={themeMode}
                    />

                    <MasterFormSelect
                      value={formData.interState}
                      onChange={(value) => handleInputChange('interState', value)}
                      options={interStateOptions}
                      placeholder="Inter State"
                      label="Inter State"
                      theme={themeMode}
                    />
                  </div>

                  {/* Discount, Credit Days, Credit Limit - Three columns */}
                  <div className="grid grid-cols-3 gap-3">
                    <MasterFormInput
                      value={formData.discount}
                      onChange={(value) => handleInputChange('discount', value)}
                      placeholder="Disco..."
                      label="Discount %"
                      type="number"
                      theme={themeMode}
                    />

                    <MasterFormInput
                      value={formData.creditDays}
                      onChange={(value) => handleInputChange('creditDays', value)}
                      placeholder="Credit Days"
                      label="Credit Days"
                      type="number"
                      theme={themeMode}
                    />

                    <MasterFormInput
                      value={formData.creditLimit}
                      onChange={(value) => handleInputChange('creditLimit', value)}
                      placeholder="Credit..."
                      label="Credit Limit"
                      type="number"
                      theme={themeMode}
                    />
                  </div>

                  {/* Email */}
                  <MasterFormInput
                    value={formData.email}
                    onChange={(value) => handleInputChange('email', value)}
                    placeholder="Email"
                    label="Email"
                    type="email"
                    theme={themeMode}
                  />
                </div>
              </div>
            </div>
          </MasterFormCard>
        </div>
      </div>
    </MasterLayout>
  );
}
