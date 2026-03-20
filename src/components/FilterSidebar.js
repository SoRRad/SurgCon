import { useState } from 'react';
import { getLocationFilterLabel } from '../utils/filterConferences';

function FilterSidebar({ filters, options, onFilterChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const locationLabel = getLocationFilterLabel(filters.regionGroup);

  function handleFieldChange(event) {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

    if (name === 'regionGroup') {
      onFilterChange('regionGroup', nextValue);
      onFilterChange('locationValue', 'All');
      onFilterChange('city', 'All');
      return;
    }

    onFilterChange(name, nextValue);
  }

  return (
    <aside className="filter-sidebar">
      <button
        type="button"
        className="filter-sidebar__toggle"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        {isOpen ? 'Hide filters' : 'Show filters'}
      </button>

      <div className={isOpen ? 'filter-sidebar__panel is-open' : 'filter-sidebar__panel'}>
        <div className="filter-sidebar__header">
          <div>
            <p className="eyebrow">Directory filters</p>
            <h2>Refine the conference set</h2>
          </div>
          <button type="button" className="text-button" onClick={onReset}>
            Reset
          </button>
        </div>

        <label className="filter-sidebar__search">
          Search
          <input
            type="search"
            name="search"
            value={filters.search}
            onChange={handleFieldChange}
            placeholder="Conference, specialty, tag, venue, or city"
          />
        </label>

        <div className="filter-sidebar__group">
          <p className="filter-sidebar__group-title">Specialty</p>
          <label>
            Specialty
            <select name="specialty" value={filters.specialty} onChange={handleFieldChange}>
              <option value="All">All specialties</option>
              {options.specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filter-sidebar__group">
          <p className="filter-sidebar__group-title">Quick filters</p>
          <label>
            Quick focus
            <select name="quickFilter" value={filters.quickFilter} onChange={handleFieldChange}>
              {options.quickFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sort by
            <select name="sortBy" value={filters.sortBy} onChange={handleFieldChange}>
              {options.sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filter-sidebar__group">
          <p className="filter-sidebar__group-title">Time and place</p>
          <label>
            Year
            <select name="year" value={filters.year} onChange={handleFieldChange}>
              <option value="All">All years</option>
              {options.years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <label>
            Region group
            <select name="regionGroup" value={filters.regionGroup} onChange={handleFieldChange}>
              <option value="All">All regions</option>
              {options.regionGroups.map((regionGroup) => (
                <option key={regionGroup} value={regionGroup}>
                  {regionGroup}
                </option>
              ))}
            </select>
          </label>

          <label>
            {locationLabel}
            <select name="locationValue" value={filters.locationValue} onChange={handleFieldChange}>
              <option value="All">All options</option>
              {options.locationOptions.map((optionValue) => (
                <option key={optionValue} value={optionValue}>
                  {optionValue}
                </option>
              ))}
            </select>
          </label>

          <label>
            City
            <select name="city" value={filters.city} onChange={handleFieldChange}>
              <option value="All">All cities</option>
              {options.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filter-sidebar__group">
          <p className="filter-sidebar__group-title">Format and discovery</p>
          <label>
            Format
            <select name="format" value={filters.format} onChange={handleFieldChange}>
              <option value="All">All formats</option>
              {options.formats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tag
            <select name="tag" value={filters.tag} onChange={handleFieldChange}>
              <option value="All">All tags</option>
              {options.tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </label>

          <label>
            Deadline status
            <select name="deadlineStatus" value={filters.deadlineStatus} onChange={handleFieldChange}>
              <option value="All">All statuses</option>
              {options.deadlineStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            Source trust
            <select name="trustLabel" value={filters.trustLabel} onChange={handleFieldChange}>
              <option value="All">All trust levels</option>
              {options.trustLabels.map((trustLabel) => (
                <option key={trustLabel} value={trustLabel}>
                  {trustLabel}
                </option>
              ))}
            </select>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="bookmarkedOnly"
              checked={filters.bookmarkedOnly}
              onChange={handleFieldChange}
            />
            <span>Bookmarked only</span>
          </label>
        </div>
      </div>
    </aside>
  );
}

export default FilterSidebar;
