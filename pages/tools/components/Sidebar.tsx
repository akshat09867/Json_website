import React, { Dispatch, SetStateAction, useRef } from 'react';
import FilterIcon from '~/public/icons/filter.svg';
import DropdownMenu from './ui/DropdownMenu';
import Checkbox from './ui/Checkbox';
import SearchBar from './SearchBar';
import toTitleCase from '../lib/toTitleCase';
import type { Transform } from '../hooks/useToolsTransform';
import type { FilterCriteriaFields } from '../index.page';
import { postAnalytics } from '../lib/postAnalytics';

interface SidebarProps {
  filterCriteria: Record<FilterCriteriaFields, string[]>;
  transform: Transform;
  setTransform: Dispatch<SetStateAction<Transform>>;
  resetTransform: () => void;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({
  filterCriteria,
  transform,
  setTransform,
  resetTransform,
  setIsSidebarOpen,
}: SidebarProps) {
  const filterFormRef = useRef<HTMLFormElement>(null);

  const filters = [
    { label: 'Languages', accessorKey: 'languages' },
    { label: 'Drafts', accessorKey: 'drafts' },
    { label: 'Tooling Types', accessorKey: 'toolingTypes' },
    { label: 'License', accessorKey: 'licenses' },
  ];

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterFormRef.current) return;
    const formData = new FormData(filterFormRef.current);
    setTransform((prev) => {
      const newTransform = {
        query: (formData.get('query') as Transform['query']) || '',
        sortBy: prev.sortBy || 'name',
        sortOrder: prev.sortOrder || 'ascending',
        groupBy: prev.groupBy || 'toolingTypes',
        languages: formData.getAll('languages').map((value) => value as string),
        licenses: formData.getAll('licenses').map((value) => value as string),
        drafts: formData
          .getAll('drafts')
          .map((value) => value) as Transform['drafts'],
        toolingTypes: formData
          .getAll('toolingTypes')
          .map((value) => value as string),
      };
      postAnalytics({ eventType: 'query', eventPayload: newTransform });
      return newTransform;
    });
    setIsSidebarOpen((prev) => !prev);
  };

  const clearFilters = () => {
    if (filterFormRef.current) {
      filterFormRef.current.reset();
    }
    resetTransform();
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className='pb-4 top-12 mx-auto lg:ml-4 lg:mt-8 w-4/5 h-fit'>
      <form onSubmit={applyFilters} ref={filterFormRef} className='w-full'>
        <SearchBar transform={transform} />
        {filters.map(({ label, accessorKey }) => {
          const checkedValues = transform[accessorKey as keyof Transform] || [];
          return (
            <DropdownMenu key={accessorKey} label={label} icon={<FilterIcon />}>
              {filterCriteria[accessorKey as FilterCriteriaFields]
                ?.map(String)
                .map((filterOption) => (
                  <Checkbox
                    key={filterOption}
                    label={
                      label === 'Tooling Types'
                        ? toTitleCase(filterOption, '-')
                        : filterOption
                    }
                    value={filterOption}
                    name={accessorKey}
                    checked={checkedValues.includes(filterOption)}
                  />
                ))}
            </DropdownMenu>
          );
        })}

        <div className='w-full flex items-center justify-between mt-4 gap-2'>
          <button
            type='submit'
            className='bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none'
          >
            Apply Filters
          </button>
          <button
            type='button'
            className='bg-slate-200 dark:bg-slate-900 text-gray-700 dark:text-slate-200 px-4 py-2 rounded hover:bg-slate-300 focus:outline-none'
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </form>
    </div>
  );
}