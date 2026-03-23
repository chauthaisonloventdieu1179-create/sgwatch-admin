"use client";
import React from "react";
import {
  ChevronLeftIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  paginate,
}) => {
  const pageNumbers: (number | "...")[] = [];
  const getPageNumbers = () => {
    if (totalPages <= 10) {
      for (let number = 1; number <= totalPages; number++) {
        pageNumbers.push(number);
      }
    } else {
      if (currentPage <= 5) {
        for (let number = 1; number <= 10; number++) {
          pageNumbers.push(number);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 5) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let number = totalPages - 9; number <= totalPages; number++) {
          pageNumbers.push(number);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (
          let number = currentPage - 2;
          number <= currentPage + 2;
          number++
        ) {
          pageNumbers.push(number);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
  };

  getPageNumbers();
  return (
    <nav
      aria-label="Pagination"
      style={{
        marginTop: "20px",
        marginBottom: "30px",
        display: "inline-flex",
        borderRadius: "0.375rem",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => paginate(1)} // Go to the first page
        disabled={currentPage === 1}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          padding: "8px",
          border: "1px solid #D1D5DB",
          borderRadius: "50%",
          cursor: "pointer",
          transition: "background-color 0.2s",
          marginRight: "12px",
        }}
        className={` ${
          currentPage === 1 ? "" : "hover:bg-[#212222] hover:text-white "
        }  text-[#9CA3AF]`}
      >
        <span style={{ display: "none" }}>First Page</span>
        <ChevronDoubleRightIcon
          style={{ width: "20px", height: "20px", transform: "rotate(180deg)" }}
        />
      </button>
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          padding: "8px",
          border: "1px solid #D1D5DB",
          borderRadius: "50%",
          cursor: "pointer",
          transition: "background-color 0.2s",
          marginRight: "12px",
        }}
        className={` ${
          currentPage === 1 ? "" : "hover:bg-[#212222] hover:text-white "
        }  text-[#9CA3AF]`}
      >
        <span style={{ display: "none" }}>Previous</span>
        <ChevronLeftIcon style={{ width: "20px", height: "20px" }} />
      </button>
      <div style={{ display: "flex", gap: "12px" }}>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => {
              if (typeof number === "number") {
                paginate(number);
              }
            }}
            style={{
              padding: "8px",
              width: "40px",
              height: "40px",
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "600",
              border: "1px solid #D1D5DB",
              cursor: "pointer",
              borderRadius: "50%", // Make the page number button circular
            }}
            aria-current={currentPage === number ? "page" : undefined}
            className={`transition ${
              currentPage !== number
                ? "hover:bg-[#212222] hover:text-white text-[#1F2937] transparent"
                : " text-[#FFFFFF] bg-[#212222] "
            }`}
          >
            {number}
          </button>
        ))}
      </div>

      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          padding: "8px",
          border: "1px solid #D1D5DB",
          borderRadius: "50%",
          cursor: "pointer",
          transition: "background-color 0.2s",
          marginLeft: "12px",
        }}
        className={` ${
          currentPage === totalPages
            ? ""
            : "hover:bg-[#212222] hover:text-white "
        }  text-[#9CA3AF]`}
      >
        <span style={{ display: "none" }}>Next</span>
        <ChevronRightIcon style={{ width: "20px", height: "20px" }} />
      </button>

      <button
        onClick={() => paginate(totalPages)}
        disabled={currentPage === totalPages}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          padding: "8px",
          border: "1px solid #D1D5DB",
          borderRadius: "50%",
          cursor: "pointer",
          transition: "background-color 0.2s",
          marginLeft: "12px",
        }}
        className={` ${
          currentPage === totalPages
            ? ""
            : "hover:bg-[#212222] hover:text-white "
        }  text-[#9CA3AF]`}
      >
        <span style={{ display: "none" }}>Last Page</span>
        <ChevronDoubleLeftIcon
          style={{ width: "20px", height: "20px", transform: "rotate(180deg)" }}
        />
      </button>
    </nav>
  );
};

export default Pagination;
